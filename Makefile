IMGNAME?=ghcr.io/libertech-fr/mailrest
APPNAME?=mailrest
APPPORT?=7200

init:
	@docker build -t $(IMGNAME) .
	@docker exec -it $(APPNAME) yarn install

build:
	docker build -t $(IMGNAME) .

compile:
	@docker run --rm -it \
		-e NODE_ENV=development \
		-e NODE_TLS_REJECT_UNAUTHORIZED=0 \
		--add-host host.docker.internal:host-gateway \
		--name $(APPNAME) \
		--network dev \
		-p $(APPPORT):7200 \
		-v $(CURDIR):/usr/src/app \
		$(IMGNAME) yarn build

dev:
	@docker run -it --rm \
		-e NODE_ENV=development \
		-e NODE_TLS_REJECT_UNAUTHORIZED=0 \
		--add-host host.docker.internal:host-gateway \
		--name $(APPNAME) \
		--network dev \
		-p $(APPPORT):7200 \
		-v $(CURDIR):/usr/src/app \
		$(IMGNAME) yarn start:dev

prod:
	@docker run -it --rm \
		-e NODE_ENV=production \
		-e NODE_TLS_REJECT_UNAUTHORIZED=0 \
		--add-host host.docker.internal:host-gateway \
		--name $(APPNAME) \
		--network dev \
		-p $(APPPORT):7200 \
		-v $(CURDIR):/usr/src/app \
		$(IMGNAME) yarn start:prod

exec:
	@docker run -it --rm \
		--add-host host.docker.internal:host-gateway \
		-e NODE_ENV=development \
		--network dev \
		-v $(CURDIR):/usr/src/app \
		$(IMGNAME) sh

generate:
	@docker exec -it $(APPNAME) yarn generate

dbs:
	@docker run --rm -d \
		-p 1080:1080 \
		-p 1025:1025 \
		maildev/maildev
#	@docker volume create $(APPNAME)-redis
#	@docker run -d --rm \
#		--name $(APPNAME)-redis \
#		--network dev \
#		-p 6379:6379 \
#		redis

stop:
	@docker stop $(APPNAME) || true
	@docker stop $(APPNAME)-redis || true

rm:
	docker rm $(shell docker ps -a -q -f name=$(APPNAME))
