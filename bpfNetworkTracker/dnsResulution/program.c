#include <net/inet_sock.h>
#include <linux/nsproxy.h>
#include <linux/utsname.h>

#define MAX_PKT 128
struct dns_data_t {
    u8 pkt[MAX_PKT];
};

// store msghdr pointer captured on syscall entry to parse on syscall return
BPF_HASH(tbl_udp_msg_hdr, u64, struct msghdr *);

// single element per-cpu array to hold the current event off the stack
BPF_PERCPU_ARRAY(dns_data,struct dns_data_t,1);

int trace_udp_recvmsg(struct pt_regs *ctx)
{
    __u64 pid_tgid = bpf_get_current_pid_tgid();
    struct sock *sk = (struct sock *)PT_REGS_PARM1(ctx);
    struct inet_sock *is = inet_sk(sk);

    // only grab port 53 packets, 13568 is ntohs(53)
    if (is->inet_dport == 13568) {
        struct msghdr *msghdr = (struct msghdr *)PT_REGS_PARM2(ctx);
        tbl_udp_msg_hdr.update(&pid_tgid, &msghdr);
    }
    return 0;
}

struct process_info {
    char src_pod_name[__NEW_UTS_LEN];
    char process[16];
    u8 pkt[MAX_PKT];
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

    struct msghdr *msghdr = (struct msghdr *)*msgpp;
    if (msghdr->msg_iter.iter_type != ITER_IOVEC)
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
    bpf_probe_read_kernel_str(
        &pd.src_pod_name, 
        sizeof(pd.src_pod_name), 
        task->nsproxy->uts_ns->name.nodename
    );

    bpf_probe_read_kernel_str(
        &pd.process, 
        sizeof(pd.process), 
        task->comm
    );

    data_process.increment(pd);

delete_and_return:
    tbl_udp_msg_hdr.delete(&pid_tgid);
    return 0;
}