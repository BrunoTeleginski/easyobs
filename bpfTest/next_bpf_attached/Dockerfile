FROM ubuntu:22.04

RUN mkdir /app
COPY . /app
WORKDIR /app

RUN apt-get update
RUN apt-get install -y net-tools netcat bison build-essential cmake flex git libedit-dev libllvm14 llvm-14-dev libclang-14-dev python3 zlib1g-dev libelf-dev libfl-dev python3-distutils python3-pip git zip curl

RUN chmod 777 /app/installs.sh
RUN ./app/installs.sh

CMD ["python3","-m", "attacher.py"]