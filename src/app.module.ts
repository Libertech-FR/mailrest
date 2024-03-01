import { RedisModule } from '@nestjs-modules/ioredis'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RedisOptions } from 'ioredis'
import { AuthModule } from '~/auth/auth.module'
import configInstance from '~/config'
import { AccountsModule } from './accounts/accounts.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TokensModule } from './tokens/tokens.module'
import { ImapflowModule } from './imapflow/imapflow.module'
import { APP_GUARD, APP_PIPE } from '@nestjs/core'
import { CronModule } from '~/accounts/cron/cron.module'
import { AuthGuard } from '~/_common/guards/auth.guard'
import { AccessControlModule, RolesBuilder } from 'nest-access-control'
import { AclsService } from '~/acls/acls.service'
import { AclsModule } from '~/acls/acls.module'
import { AclGuard } from '~/_common/guards/acl.guard'
import { DtoValidationPipe } from '~/_common/pipes/dto-validation.pipe'
import { ScheduleModule } from '@nestjs/schedule'
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer'
import { AccountsMetadataV1 } from '~/accounts/_dto/account.dto'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configInstance],
    }),
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
    ImapflowModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        config: config.get<AccountsMetadataV1[]>('mailer.accounts'),
      }),
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        ...config.get<MailerOptions>('mailer.options'),
      }),
    }),
    AccessControlModule.forRootAsync({
      imports: [AclsModule],
      inject: [AclsService],
      useFactory: async (aclService: AclsService) => {
        return new RolesBuilder(await aclService.getGrantsObject())
      },
    }),
    ScheduleModule.forRoot(),
    AccountsModule.register(),
    AuthModule,
    CronModule,
    TokensModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AclGuard,
    },
    {
      provide: APP_PIPE,
      useClass: DtoValidationPipe,
    },
  ],
})
export class AppModule {}
