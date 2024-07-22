#include <uapi/linux/ptrace.h>
#include <linux/tcp.h>
#include <net/sock.h>
#include <bcc/proto.h>
#include <linux/inet.h>
#include <linux/nsproxy.h>
#include <linux/sched.h>
#include <linux/ns_common.h>
#include <uapi/linux/bpf.h>
#include <linux/utsname.h>
#include <net/inet_sock.h>

struct ipv4_data {
    u32 pid;
    u32 saddr;
    u32 daddr;
    u64 port;
    char src_pod_name[__NEW_UTS_LEN];
    char process[16];
};

BPF_HASH(ipv4_data_return, struct ipv4_data);


//path: /sys/kernel/debug/tracing/events/sock/inet_sock_set_state
//tracepoint: tracepoint:sock:inet_sock_set_state
//TRACEPOINT_PROBE(category, event)
TRACEPOINT_PROBE(sock, inet_sock_set_state)
{
    if (args->protocol != IPPROTO_TCP)
        return 0;

    //get the process id that generates the event
    u32 pid = bpf_get_current_pid_tgid() >> 32;

    //get the socket
    struct sock *sk = (struct sock *)args->skaddr;
    
    if (args->family == AF_INET) {
        
        //initialize the structure
        struct ipv4_data data_ipv4={};
        data_ipv4.pid = pid;
        data_ipv4.port = args->dport;
        __builtin_memcpy(&data_ipv4.saddr, args->saddr, sizeof(data_ipv4.saddr));
        __builtin_memcpy(&data_ipv4.daddr, args->daddr, sizeof(data_ipv4.daddr));
        
        //get the task_struct from the proccess where the connection originated from
        struct task_struct *task = (struct task_struct *)bpf_get_current_task();

        //copy from the nsproxy extracted from the task to get the name of the pod
        bpf_probe_read_kernel_str(
            &data_ipv4.src_pod_name, 
            sizeof(data_ipv4.src_pod_name), 
            task->nsproxy->uts_ns->name.nodename
        );

        bpf_probe_read_kernel_str(
            &data_ipv4.process, 
            sizeof(data_ipv4.process), 
            task->comm
        );
        
        
        ipv4_data_return.increment(data_ipv4);

    }

    return 0;
}




#define MAX_PKT 128
struct dns_data_t {
    u8 pkt[MAX_PKT];
};

// store msghdr pointer captured on syscall entry to parse on syscall return
BPF_HASH(tbl_udp_msg_hdr, u64, struct msghdr *);
BPF_HASH(tbl_udp_inet, u64, struct inet_sock *);

// single element per-cpu array to hold the current event off the stack
BPF_PERCPU_ARRAY(dns_data,struct dns_data_t,1);

int trace_udp_recvmsg(struct pt_regs *ctx)
{
    __u64 pid_tgid = bpf_get_current_pid_tgid();
    struct sock *sk = (struct sock *)PT_REGS_PARM1(ctx);
    struct inet_sock *is = inet_sk(sk);

    // only grab port 53 and 5300 (coredns)
    if (is->inet_dport == ntohs(53) || is->inet_dport == ntohs(5300)) {
        struct msghdr *msghdr = (struct msghdr *)PT_REGS_PARM2(ctx);
        tbl_udp_msg_hdr.update(&pid_tgid, &msghdr);
        tbl_udp_inet.update(&pid_tgid, &is);
    }
    return 0;
}

struct process_info {
    char src_pod_name[__NEW_UTS_LEN];
    char process[16];
    u8 pkt[MAX_PKT];
    __be32 addr;
};
BPF_HASH(data_process, struct process_info);

int trace_udp_ret_recvmsg(struct pt_regs *ctx)
{
    struct task_struct *task = (struct task_struct *)bpf_get_current_task();

    __u64 pid_tgid = bpf_get_current_pid_tgid();
    u32 zero = 0;
    struct msghdr **msgpp = tbl_udp_msg_hdr.lookup(&pid_tgid);
    if (msgpp == 0)
        return 0;

    //IF UNDER KERNEL VERSION 5.14
    struct msghdr *msghdr = (struct msghdr *)*msgpp;
    if (msghdr->msg_iter.type != ITER_IOVEC)
        goto delete_and_return;
    
    

    int copied = (int)PT_REGS_RC(ctx);
    if (copied < 0)
        goto delete_and_return;
    size_t buflen = (size_t)copied;

    if (buflen > msghdr->msg_iter.iov->iov_len)
        goto delete_and_return;

    if (buflen > MAX_PKT)
        buflen = MAX_PKT;

    struct dns_data_t *data = dns_data.lookup(&zero);
    if (!data) // this should never happen, just making the verifier happy
        return 0;

    struct process_info pd;

    void *iovbase = msghdr->msg_iter.iov->iov_base;
    //bpf_probe_read(data->pkt, buflen, iovbase);
    bpf_probe_read(&pd.pkt, sizeof(pd.pkt), iovbase);
    
    //copy from the nsproxy extracted from the task to get the name of the pod
    bpf_probe_read_kernel_str(&pd.src_pod_name, sizeof(pd.src_pod_name), task->nsproxy->uts_ns->name.nodename);
    bpf_probe_read_kernel_str(&pd.process, sizeof(pd.process), task->comm);

    //get the inet_sock from the bpf map
    struct inet_sock **inet_socket_ = tbl_udp_inet.lookup(&pid_tgid);
    if (inet_socket_ == 0)
        return 0;

    struct inet_sock *inet_s = (struct inet_sock *)*inet_socket_;

    bpf_probe_read_kernel(&pd.addr, sizeof(pd.addr), &inet_s->inet_saddr);

    data_process.increment(pd);

delete_and_return:
    tbl_udp_msg_hdr.delete(&pid_tgid);
    return 0;
}