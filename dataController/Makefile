FILE=VERSION
VERSION=$(shell cat ${FILE})

proto:
	@protoc *.proto --go_out=./ --go-grpc_out=./

run: 
	@go run server.go

build:
	docker build . -t brunoteleginski/easyobs-data-controller:$(VERSION) \

push:
	docker push brunoteleginski/easyobs-data-controller:$(VERSION) \

build-push: build
	docker push brunoteleginski/easyobs-data-controller:$(VERSION) \