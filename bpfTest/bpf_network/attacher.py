#!/usr/bin/env python
from bcc import BPF
from time import sleep
from socket import inet_ntop, AF_INET
from struct import pack
import logging

logging.basicConfig(
    level=logging.INFO, 
    format='%(message)s'
)

""" NOTE
to check if the tracepoint exists, you must mount the path: "/sys/kernel/debug" 
from the node using hostpath in k8s
"""
if (BPF.tracepoint_exists("sock", "inet_sock_set_state")):
    b = BPF(src_file="program.c")
    
    b.trace_print() #NOTE: active!

    keepRunning = True
    while keepRunning:
        try:
            sleep(2)
        except KeyboardInterrupt:
            keepRunning = False
        
        #NOTE Connections on UDP
        currsock = b["ipv4_data_return"]
        for k,v in currsock.items():
            
            src=inet_ntop(AF_INET, pack("I", k.saddr))
            dst=inet_ntop(AF_INET, pack("I", k.daddr))
            pod = k.src_pod_name.decode("utf-8")
            comm = k.comm.decode("utf-8")
            
            if(str(pod).find("aks-") == -1):

                for chardata in k.data:
                    print(chardata)

                # logging.info({
                #     "task": comm,
                #     "src_ip": src,
                #     "dst_ip": dst,
                #     "dst_port": k.port,
                #     "src_pod_name": pod
                # })

            # if(str(src).find("10.244.2.16") == -1):
            #     continue

            # print({
            #     "pid": k.pid,
            #     "src_ip": src,
            #     "dst_ip": dst,
            #     "dst_port": k.port,
            #     "src_pod_name": k.src_pod_name.decode("utf-8")
            # })

        currsock.clear()