from bcc import BPF
from time import sleep
from socket import inet_ntop, AF_INET
from struct import pack
import logging
import datetime
import dnslib
from cachetools import TTLCache
from struct import pack
from time import sleep
from datetime import datetime

def payload_to_DNS(payload):
    try:
        # pass the payload to dnslib for parsing
        dnspkt = dnslib.DNSRecord.parse(payload)
        # lets only look at responses
        if dnspkt.header.qr != 1:
            return
        # must be some questions in there
        if dnspkt.header.q != 1:
            return
        # make sure there are answers
        if dnspkt.header.a == 0 and dnspkt.header.aa == 0:
            return

        # lop off the trailing .
        return ("%s" % dnspkt.q.qname)[:-1]
    except Exception as e:
        return ""

logging.basicConfig(
    level=logging.INFO, 
    format='%(message)s'
)

b = BPF(src_file="program.c")
b.attach_kprobe(event="udp_recvmsg", fn_name="trace_udp_recvmsg")
b.attach_kretprobe(event="udp_recvmsg", fn_name="trace_udp_ret_recvmsg")

#b.trace_print()

keepRunning = True
while keepRunning:
    try:
        data_process = b["data_process"]
        for k,v in data_process.items():
            dnsrecord = payload_to_DNS(k.pkt[:len(k.pkt)])

            if not dnsrecord:
                continue

            pod=""
            process=""
            if k.src_pod_name:
                pod=k.src_pod_name.decode("utf-8")
            if k.process:
                process=k.process.decode("utf-8")

            print(
                pod,
                process,
                dnsrecord
            )

        data_process.clear()

    except KeyboardInterrupt:
        keepRunning = False
        data_process.clear()