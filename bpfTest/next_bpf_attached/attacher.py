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

b = BPF(src_file="program.c")
b.trace_print()

# keepRunning = True
# while keepRunning:
#     try:
#         sleep(2)
#     except KeyboardInterrupt:
#         keepRunning = False
    
#     #NOTE Connections on UDP
#     currsock = b["ipv4_data_return"]
#     for k,v in currsock.items():
        
#         src=inet_ntop(AF_INET, pack("I", k.saddr))
#         dst=inet_ntop(AF_INET, pack("I", k.daddr))

#         logging.info({
#             "pid": k.pid,
#             "src_ip": src,
#             "dst_ip": dst,
#             "dst_port": k.port,
#             "src_pod_name": k.src_pod_name.decode("utf-8")
#         })

#         # if(str(src).find("10.244.2.16") == -1):
#         #     continue

#         # print({
#         #     "pid": k.pid,
#         #     "src_ip": src,
#         #     "dst_ip": dst,
#         #     "dst_port": k.port,
#         #     "src_pod_name": k.src_pod_name.decode("utf-8")
#         # })

#     currsock.clear()