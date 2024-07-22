FILE=VERSION
VERSION=$(shell cat ${FILE})

generateProto:
	@python3 -m grpc_tools.protoc --proto_path=. ./proto/data.proto --python_out=. --grpc_python_out=.

install:
	@pip install protobuf && pip install grpcio && pip install grpcio-tools && pip install dnslib

build:
	docker build . -t brunoteleginski/bpf-xdp:$(VERSION) \

push:
	docker push brunoteleginski/bpf-xdp:$(VERSION) \

build-push: build push