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

def print_event(ctx, data, size):
    event = ct.cast(data, ct.POINTER(Data)).contents


# NOTE: Write content in the buffer
# def stringToByteArray(strg, maxCharLen):
#     bArray = bytearray()
#     bArray.extend(strg.encode('ascii'))
#     bArray.extend((0,) * (maxCharLen - len(bArray)))
#     return (ct.c_ubyte * len(bArray)).from_buffer(bArray)


b = BPF(src_file="program.c")
#b.trace_print()

keepRunning = True
while keepRunning:
    try:
        sleep(2)
    except KeyboardInterrupt:
        keepRunning = False
        b["file"].clear()

    #NOTE Connections on UDP
    file = b["file"]

    for k,v in file.items():
        pod_name = k.pod_name.decode("utf-8")
        
        if "fluent" in pod_name:
            buf = ""
            try:
                buf = k.buf.decode("utf-8")
            except:
                continue

            print({
                "pid": k.pid,
                "buf": buf,
                "pod_name": pod_name,
            })

    file.clear()