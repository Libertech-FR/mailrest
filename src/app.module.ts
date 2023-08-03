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
import { WebhooksModule } from './webhooks/webhooks.module';

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
    AuthModule,
    TokensModule,
    AccountsModule.register(),
    WebhooksModule,
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
