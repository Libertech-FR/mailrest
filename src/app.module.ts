import { RedisModule } from '@nestjs-modules/ioredis'
import { ClassSerializerInterceptor, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { RedisOptions } from 'ioredis'
import { AuthModule } from '~/auth/auth.module'
import configInstance from '~/config'
import { AccountsModule } from './accounts/accounts.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TokensModule } from './tokens/tokens.module'
import { WebhooksModule } from './webhooks/webhooks.module'
import { ImapflowModule } from './imapflow/imapflow.module'
import { AccountsMetadataV1 } from './accounts/accounts.setup'
import { APP_INTERCEPTOR } from '@nestjs/core'

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
    AuthModule,
    TokensModule,
    AccountsModule.register(),
    WebhooksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
  ],
})
export class AppModule {}
