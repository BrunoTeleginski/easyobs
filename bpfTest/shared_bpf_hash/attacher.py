#!/usr/bin/env python
from bcc import BPF
from time import sleep
from socket import inet_ntop, AF_INET
from struct import pack
import logging
import ctypes as ct

logging.basicConfig(
    level=logging.INFO, 
    format='%(message)s'
)
    

def stringToByteArray(strg, maxCharLen):
    bArray = bytearray()
    bArray.extend(strg.encode('ascii'))
    bArray.extend((0,) * (maxCharLen - len(bArray)))
    return (ct.c_ubyte * len(bArray)).from_buffer(bArray)

""" NOTE
to check if the tracepoint exists, you must mount the path: "/sys/kernel/debug" 
from the node using hostpath in k8s
"""
if (BPF.tracepoint_exists("sock", "inet_sock_set_state")):
    b = BPF(src_file="program.c")
    #b.trace_print()

    keepRunning = True
    while keepRunning:
        try:
            sleep(2)
        except KeyboardInterrupt:
            keepRunning = False
            
            b["ipv4_data_return"].clear()
            b["test_map"].clear()
        
        #NOTE Connections on UDP
        currsock = b["ipv4_data_return"]
        test_map = b.get_table("test_map")

        for k,v in currsock.items():
            
            src=inet_ntop(AF_INET, pack("I", k.saddr))
            dst=inet_ntop(AF_INET, pack("I", k.daddr))

            print({
                "pid": k.pid,
                "src_ip": src,
                "dst": dst,
                "dst_port": k.port,
                "src_pod_name": k.src_pod_name.decode("utf-8"),
                "test_map_good": k.test_map_good.decode("utf-8")
            })
            
            #NOTE adding string on the hash map sending it to BPF program
            buffer_char = test_map.Leaf() #initialize the struture
            buffer_char.p = stringToByteArray("Hello string", 255)
            test_map[test_map.Key()] = buffer_char

        currsock.clear()

    #b.trace_print()