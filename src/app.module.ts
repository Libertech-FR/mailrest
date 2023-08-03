'use strict'

import { Logger, Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import configInstance from '~/config'
import { MongooseModule } from '@nestjs/mongoose'
import { RedisModule } from '@nestjs-modules/ioredis'
import { RedisOptions } from 'ioredis'
import { LdapModule } from '~/ldap/ldap.module'
import { ClientOptions } from 'ldapjs'
import { AuthModule } from '~/auth/auth.module'
import { APP_GUARD } from '@nestjs/core'
import { AuthGuard } from '~/common/auth.guard'
import { ClientsModule, Transport } from '@nestjs/microservices'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configInstance],
    }),
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async(configService: ConfigService) => ({
    //     uri: configService.get<string>('mongoose.uri'),
    //     ...configService.get<Record<string, any>>('mongoose.options'),
    //   }),
    // }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        config: {
          url: configService.get<string>('ioredis.uri'),
          ...configService.get<RedisOptions>('ioredis.options'),
        },
      }),
    }),
    ClientsModule.register([
      {
        name: 'TEST_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: 'redis-16759.c250.eu-central-1-1.ec2.cloud.redislabs.com',
          port: 16759,
          password: 'eFq2jSo2wVnzgYB5ZF6WQCZg6f1U5sZu',
        },
      },
    ]),
    // LdapModule.registerAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => {
    //     return {
    //       logger: new Logger('LDAP'),
    //       client: configService.get<ClientOptions>('ldap.client'),
    //     }
    //   },
    // }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
  ],
})
export class AppModule {}
