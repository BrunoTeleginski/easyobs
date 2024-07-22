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

struct ipv4_data {
    u32 pid;
    u32 saddr;
    u32 daddr;
    u64 port;
    char src_pod_name[__NEW_UTS_LEN];
    char test_map_good[100];
};

BPF_HASH(ipv4_data_return, struct ipv4_data);

struct Leaf{
    unsigned char p[255];
};

BPF_HASH(test_map, int, struct Leaf, 128);


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

        //SHARED HASH MAP
        int key = 0;
        struct Leaf *shared_string = test_map.lookup(&key);
        if(shared_string){
            
            //bpf_trace_printk("%s\n", shared_string->p);

            bpf_probe_read_kernel_str(
                &data_ipv4.test_map_good, 
                sizeof(data_ipv4.test_map_good), 
                shared_string
            ); 
        }
        
        ipv4_data_return.increment(data_ipv4);
    }

    return 0;
}