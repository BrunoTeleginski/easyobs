RELEASE_NAME=$(shell yq '.name' Chart.yaml)
VERSION=$(shell yq '.version' Chart.yaml)

helm-update:
	@helm dependencies update .

helm-build:
	@helm dependencies build .

helm-pack:
	@helm package .

helm-install:
	@helm upgrade --install easyobs $(RELEASE_NAME)-$(VERSION).tgz -n easyobs

helm-clear:
	@rm $(RELEASE_NAME)-$(VERSION).tgz

helm: helm-update helm-build helm-pack helm-install helm-clear
