FILE=VERSION
VERSION=$(shell cat ${FILE})

run:
	npm run dev \

app-build:
	npm run build \

build: app-build
	docker build . -t brunoteleginski/easyobs-frontend:$(VERSION) \

push:
	docker push brunoteleginski/easyobs-frontend:$(VERSION) \

build-push: app-build build
	docker push brunoteleginski/easyobs-frontend:$(VERSION) \