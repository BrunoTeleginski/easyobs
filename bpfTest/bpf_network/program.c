#include <uapi/linux/ptrace.h>
#include <asm/types.h>
#include <asm/byteorder.h>
#include <linux/bpf.h>
#include <linux/filter.h>
#include <linux/in.h>
#include <linux/ip.h>
#include <linux/tcp.h>
#include <linux/if_ether.h>
#include <net/sock.h>
#include <bcc/proto.h>
#include <linux/inet.h>
#include <linux/nsproxy.h>
#include <linux/sched.h>
#include <linux/ns_common.h>
#include <uapi/linux/bpf.h>
#include <linux/utsname.h>
#include <linux/udp.h>

struct ipv4_data {
    u32 pid;
    u32 saddr;
    u32 daddr;
    u64 port;
    char src_pod_name[__NEW_UTS_LEN];
    char comm[TASK_COMM_LEN];
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

    struct sk_buff *skb = (struct sk_buff *)args->skaddr;
    void *packet_end = skb_metadata_end(skb);
    void *packet = (void *)(long)skb->data;
    
    struct ethhdr *eth = packet;
    if (eth + 1 > (struct ethhdr *)packet_end){
        return 0;
    }

    struct iphdr *ip_header = packet + sizeof(struct ethhdr);
    if (ip_header + 1 > (struct iphdr *)packet_end){
        return 0;
    }

    if (unlikely(ip_header->protocol != IPPROTO_TCP && ip_header->protocol != IPPROTO_UDP)){
        return 0;
    }

    uint16_t l4len = 0;
    if (ip_header->protocol == IPPROTO_TCP){

        struct tcphdr *tcph = packet + sizeof(struct ethhdr) + (ip_header->ihl * 4);

        // if (tcph + 1 > (struct tcphdr *)packet_end){
        //     return 0;
        // }
        // l4len = tcph->doff * 4;
    }
    else{
        l4len = 8;
    }
    
    
    //bpf_trace_printk("%d \n", l4len);

    
    if (args->family == AF_INET) {
        
        //initialize the structure
        struct ipv4_data data_ipv4={};
        
        bpf_get_current_comm(&data_ipv4.comm, sizeof(data_ipv4.comm));
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
        
        ipv4_data_return.increment(data_ipv4);

    }

    return 0;
}