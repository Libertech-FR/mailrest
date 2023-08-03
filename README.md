## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

Dupliquer le .env.exemple puis supprimer la partie .exemple
Remplir ensuite les variables

Après avoir cloné le depot, lancer une release sur le depot git pour construire l'image si elle n'existe pas
Remplir les variables dans le Makefile, pour l'image, prendre celle du package du depot git commenceant par ghcr.io
Puis lancer la commande 

```bash
make exec
yarn install
```

## Running the app

```bash
#Pour lancer la bdd et autre services satelites :
make dbs

#Pour lancer l'application :
make dev

#Pour ajouter une dépendance au projet :
make exec
yarn 'nom de la dependance'
```
Le compte ldap par default est dc@ab.com/test
## Creation d'un service

Lancer la commande make generate

```bash
make generate

yarn run v1.22.19
$ nest g resource
? What name would you like to use for this resource (plural, e.g., "users")? exemple
? What transport layer do you use? REST API
? Would you like to generate CRUD entry points? Yes
CREATE src/exemple/exemple.controller.ts (946 bytes)
CREATE src/exemple/exemple.module.ts (261 bytes)
CREATE src/exemple/exemple.service.ts (649 bytes)
CREATE src/exemple/dto/create-exemple.dto.ts (33 bytes)
CREATE src/exemple/dto/update-exemple.dto.ts (181 bytes)
CREATE src/exemple/entities/exemple.entity.ts (24 bytes)
UPDATE src/app.module.ts (1956 bytes)
```
Cela va créer un nouveau dossier avec [un controller](https://docs.nestjs.com/controllers), un [service](https://docs.nestjs.com/providers) ( egalement appelé provider ), une [entity](https://docs.nestjs.com/techniques/mongodb#model-injection) (equivalent au model), un [module](https://docs.nestjs.com/modules) ainsi que des [DTO](https://docs.nestjs.com/pipes#class-validator) 


[Nest Generate](https://docs.nestjs.com/cli/usages#nest-generate)


## Mise en production

- Créer un dossier ui dans le quel il y a un fichier Dockerfile du front ainsi que le .env
- Créer un dossier api dans le quel il y a le .env du back
- Dans le .env du back, remplir les données relatives au ldap
- Dans /ui/.env, changer la variable APP_BASE_URL en mettant le nom du conteneur exemple.api et son port
- Modifier ce docker-compose pour que les noms de services/images soient cohérents 

```yml
version: '3'
services:
  exemple.ui:
    container_name: exemple.ui
    build: ./ui/
    restart: always
    volumes:
      - ./ui/.env:/usr/src/app/.env
    environment:
      - NODE_TLS_REJECT_UNAUTHORIZED=0
    ports:
      - 3000:3000
    networks:
      - exemple

  exemple.api:
    container_name: exemple.api
    image: ghcr.io/libertech-fr/exemple.service:latest
    restart: always
    volumes:
      - ./api/.env:/usr/src/app/.env
    environment:
      - NODE_TLS_REJECT_UNAUTHORIZED=0
    ports:
      - 4000:4000
    networks:
      - exemple
      - reverse

  exemple.mongodb:
    container_name: exemple.mongodb
    image: mongo:5.0
    command: --wiredTigerCacheSizeGB 1.5
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - ./mongo:/data/db
    networks:
      - exemple

  exemple.redis:
    container_name: exemple.redis
    image: redis:7.0
    restart: always
    networks:
      - exemple

networks:
  exemple:
  reverse:
    external: true
```


