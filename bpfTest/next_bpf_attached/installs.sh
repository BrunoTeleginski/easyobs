#!/bin/bash
apt-get update

#get the bcc from repo
cd /
git clone https://github.com/iovisor/bcc.git
mkdir /bcc/build; cd /bcc/build
cmake ..
make
make install
cmake -DPYTHON_CMD=python3 .. # build python3 binding
pushd src/python/
make
make install
popd

#cp some dependencies that doenst build auto
cp /bcc/build/src/cc/libbcc.so.0 /usr/lib/$(uname -i)-linux-gnu/
cp /bcc/build/src/cc/libbcc.so /usr/lib/$(uname -i)-linux-gnu/
cp /bcc/build/src/cc/libbcc.so.0.27.0 /usr/lib/$(uname -i)-linux-gnu/
cp /bcc/build/src/cc/libbcc_bpf.so /usr/lib/$(uname -i)-linux-gnu/
cp /bcc/build/src/cc/libbcc_bpf.so.0.27.0 /usr/lib/$(uname -i)-linux-gnu/
cp /bcc/build/src/cc/libbcc.so.0 /usr/lib/$(uname -i)-linux-gnu/
cp /bcc/build/src/cc/libbcc_bpf.so.0 /usr/lib/$(uname -i)-linux-gnu/