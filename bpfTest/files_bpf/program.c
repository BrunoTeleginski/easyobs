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
#include <linux/fdtable.h>

struct strc_file{
    char buf[70];
    char pod_name[30];
    u32 pid;
};
BPF_HASH(file, struct strc_file);

//tracepoint: tracepoint:syscalls:sys_enter_execve
TRACEPOINT_PROBE(syscalls, sys_enter_write)
{
    //struct path *dentry_copy;
    struct task_struct *task = (struct task_struct *)bpf_get_current_task();

    //bpf_trace_printk("File: %s - %d \n", filename, i);

    struct strc_file sf;

    sf.pid = bpf_get_current_pid_tgid() >> 32;

    //BUF
    bpf_probe_read(
        &sf.buf,
        sizeof(sf.buf),
        args->buf
    );

    //POD name
    bpf_probe_read_kernel_str(
        &sf.pod_name, 
        sizeof(sf.pod_name),
        task->nsproxy->uts_ns->name.nodename
    );


    file.increment(sf);

    return 0;
}