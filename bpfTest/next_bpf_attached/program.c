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


int syscall__execve(struct pt_regs *ctx,
    const char __user *filename,
    const char __user *const __user *__argv,
    const char __user *const __user *__envp)
{


    BPF_PROG_GET_NEXT_ID()

    bpf_trace_printk("filename %s \n", filename);
}