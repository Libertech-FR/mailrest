IMGNAME?=exemple
APPNAME?=exemple
APPPORT?=4500

LDAPORGANISATION?=exemple
LDAPDOMAIN?=exemple.local
LDAPPASSWORD?=
OPENLDAP_PORT?=389

MAILDEVPORTWEB?=1080
MAILDEVPORTMAIL?=1025

init:
	@docker build -t $(IMGNAME) .
	@docker exec -it $(APPNAME) yarn install
	
build:
	docker build -t $(IMGNAME) .

push:
	docker push $(IMGNAME)

compile:
	docker exec -it $(APPNAME) yarn build

dev:
	@docker run -it --rm \
		-e NODE_ENV=development \
		-e NODE_TLS_REJECT_UNAUTHORIZED=0 \
		--add-host host.docker.internal:host-gateway \
		--name $(APPNAME) \
		--network dev \
		-p $(APPPORT):4000 \
		-v $(CURDIR):/usr/src/app \
		$(IMGNAME) yarn start:dev

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
 		--name $(APPNAME)-openldap \
		-e LDAP_ORGANISATION=$(LDAPORGANISATION) \
		-e LDAP_DOMAIN=$(LDAPDOMAIN) \
		-e LDAP_ADMIN_PASSWORD=$(LDAPPASSWORD) \
		--network dev \
		-v $(CURDIR)/openldap/custom:/container/service/slapd/assets/config/bootstrap/ldif/custom \
		-p $(OPENLDAP_PORT):389 \
		osixia/openldap:1.5.0 --loglevel debug --copy-service

	@docker volume create $(APPNAME)-redis
	@docker run -d --rm \
		--name $(APPNAME)-redis \
		--network dev \
		-p 6379:6379 \
		redis
	@docker volume create $(APPNAME)-mongodb
	@docker run -d --rm \
		--name $(APPNAME)-mongodb \
		-v $(APPNAME)-mongodb:/data/db \
		-p 27017:27017 \
		--network dev \
		mongo:5.0 --wiredTigerCacheSizeGB 1.5 --quiet || true

	@docker run --rm -d \
		--name $(APPNAME)-ldapadmin \
		-e PHPLDAPADMIN_LDAP_HOSTS=ga.service.usermanager.openldap \
		-e PHPLDAPADMIN_LDAP_HOSTS="#PYTHON2BASH:[{'$(APPNAME)-openldap': [{'login': [{'bind_id': 'cn=admin,dc=test,dc=local'}]}]}]" \
		-v $(CURDIR)/phpldapadmin/exemples/:/data/exemples \
		-p 6443:443 \
		--network dev \
		osixia/phpldapadmin || true

	@docker run --rm -d --name $(APPNAME)-maildev \
  		-p $(MAILDEVPORTWEB):1080 \
  		-p $(MAILDEVPORTMAIL):1025 \
  		--network dev \
  		maildev/maildev || true

stop:
	@docker stop $(APPNAME)-maildev || true
	@docker stop $(APPNAME)-ldapadmin || true
	@docker stop $(APPNAME)-mongodb || true
	@docker stop $(APPNAME)-redis || true
	@docker stop $(APPNAME)-openldap || true
	@docker stop $(APPNAME) || true

rm:
	docker rm $(shell docker ps -a -q -f name=$(APPNAME))


openldap:
	docker run --rm -it \
 		--name $(APPNAME)-openldap \
		-e LDAP_ORGANISATION=$(LDAPORGANISATION) \
		-e LDAP_DOMAIN=$(LDAPDOMAIN) \
		-e LDAP_ADMIN_PASSWORD=$(LDAPPASSWORD) \
		--network dev \
		-v $(CURDIR)/openldap/custom:/container/service/slapd/assets/config/bootstrap/ldif/custom \
		-p $(OPENLDAP_PORT):389 \
		osixia/openldap:1.5.0 --loglevel trace --copy-service