FROM ubuntu:22.04

WORKDIR /app
COPY . /app

RUN apt-get update
RUN apt-get install -y net-tools netcat bison build-essential cmake flex git libedit-dev libllvm14 llvm-14-dev libclang-14-dev python3 zlib1g-dev libelf-dev libfl-dev python3-distutils python3-pip git zip curl
RUN pip3 install prometheus_client
RUN pip install protobuf && pip install grpcio && pip install grpcio-tools && pip install dnslib

RUN chmod 777 ./installs.sh
RUN ./installs.sh

CMD ["python3","-m", "attacher.py"]