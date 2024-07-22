FILE=VERSION
VERSION=$(shell cat ${FILE})

run: 
	@go run server.go

build:
	docker build . -t brunoteleginski/easyobs-controller:$(VERSION) \

push:
	docker push brunoteleginski/easyobs-controller:$(VERSION) \

build-push: build
	docker push brunoteleginski/easyobs-controller:$(VERSION) \