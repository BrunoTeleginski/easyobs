from bcc import BPF
from time import sleep
from socket import inet_ntop, AF_INET
from struct import pack
import logging
import proto.data_pb2 as pb2
import proto.data_pb2_grpc as pb2_grpc
import grpc
from google.protobuf.struct_pb2 import Struct
import datetime
import dnslib

#communication using GRPC
class grpcClientDataController():
     
    def __init__(self):
        #NOTE: temp IP address
        self.host = 'easyobs-data-controller-svc'
        self.server_port = 80

        # instantiate a channel
        self.channel = grpc.insecure_channel('{}:{}'.format(self.host, self.server_port))
        self.stub = pb2_grpc.DataServiceStub(self.channel)

    def sendMsg(self, messageData):
        s = Struct()
        s.update(messageData)
        message = pb2.Data(Metadata=s)
        return self.stub.Send(message)

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

""" NOTE
to check if the tracepoint exists, you must mount the path: "/sys/kernel/debug" 
from the node using hostpath in k8s
"""

b = BPF(src_file="program.c")
b.attach_kprobe(event="udp_recvmsg", fn_name="trace_udp_recvmsg")
b.attach_kretprobe(event="udp_recvmsg", fn_name="trace_udp_ret_recvmsg")
#b.trace_print()

dataController = grpcClientDataController()

keepRunning = True
while keepRunning:
    try:
        sleep(2)
    except KeyboardInterrupt:
        keepRunning = False
    

    #NOTE DNS KPROBE
    for k,v in b["data_process"].items():
        dnsrecord = payload_to_DNS(k.pkt[:len(k.pkt)])

        if not dnsrecord:
            continue

        pod=""
        process=""
        if k.src_pod_name:
            pod=k.src_pod_name.decode("utf-8")
        if k.process:
            process=k.process.decode("utf-8")

        dnsMsg = {
            "src_pod_name": pod,
            "process": process,
            "addr": inet_ntop(AF_INET, pack("I", k.addr)),
            "dst": dnsrecord,
            "time": str(datetime.datetime.now()),
            "dns": "true"
        }

        print(dnsMsg)
        try:
            res = dataController.sendMsg(dnsMsg)
        except Exception as e:
            logging.error("Error")
            continue

    b["data_process"].clear()

    #NOTE TCP CONNECTION TRACEPOINT
    if (BPF.tracepoint_exists("sock", "inet_sock_set_state")):
        currsock = b["ipv4_data_return"]
        for k,v in currsock.items():
            
            src=inet_ntop(AF_INET, pack("I", k.saddr))
            dst=inet_ntop(AF_INET, pack("I", k.daddr))
            pod = k.src_pod_name.decode("utf-8")

            if not pod or pod == "":
                continue

            if dst == "127.0.0.1" or dst == "0.0.0.0":
                continue
            
            #try to send data to GRPC server
            msg = {
                "pid": k.pid,
                "src_ip": src,
                "dst": dst,
                "dst_port": k.port,
                "src_pod_name": pod,
                "process": k.process.decode("utf-8"),
                "time": str(datetime.datetime.now())
            }
            print(msg)

            try:
                res = dataController.sendMsg(msg)
            except Exception as e:
                logging.error("Error")
                continue

        currsock.clear()