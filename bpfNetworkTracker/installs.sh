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
cp /bcc/build/src/cc/*.0 /usr/lib/$(uname -i)-linux-gnu/
cp /bcc/build/src/cc/*.so /usr/lib/$(uname -i)-linux-gnu/