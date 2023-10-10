import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface'
import { LogLevel } from '@nestjs/common'
import { RedisOptions } from 'ioredis'
import { JwtModuleOptions } from '@nestjs/jwt'
import { IAuthModuleOptions } from '@nestjs/passport'
import { BinaryLike, CipherCCMTypes, CipherGCMTypes, CipherKey, createHash } from 'crypto'
import { SwaggerCustomOptions } from '@nestjs/swagger'
import setupAccounts, { AccountsMetadataV1 } from './accounts/accounts.setup'
import setupTokens, { TokensMetadataV1 } from "~/tokens/tokens.setup";
import { MailerOptions } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'

export interface ConfigInstance {
  application: NestApplicationContextOptions
  ioredis: {
    uri: string
    options: RedisOptions
  }
  mailer: {
    accounts: AccountsMetadataV1[]
    options?: MailerOptions
  }
  crypt: {
    algorithm: string | CipherCCMTypes | CipherGCMTypes
    securityKey: CipherKey
    initVector: BinaryLike
  }
  jwt: {
    options: JwtModuleOptions
  }
  passport: PassportConfigInstance
  swagger: {
    path: string
    api: string
    options?: SwaggerCustomOptions
  }
  tokens: TokensMetadataV1[]
}

export interface PassportConfigInstance {
  options: IAuthModuleOptions
  modules?: {
    [key: string]: any
  }
}

export default async (): Promise<ConfigInstance> => {
  const mailerAccounts = await setupAccounts()
  const tokens = await setupTokens()
  return {
    application: {
      logger: process.env.LOGGER
        ? (process.env.LOGGER.split(',') as LogLevel[])
        : process.env.NODE_ENV === 'development'
        ? ['error', 'warn', 'log', 'debug']
        : ['error', 'warn', 'log'],
    },
    ioredis: {
      uri: process.env.IOREDIS_URL,
      options: {
        showFriendlyErrorStack: true,
      },
    },
    mailer: {
      accounts: mailerAccounts,
      options: {
        transports: mailerAccounts.reduce((acc, account) => {
          if (account.smtp) {
            acc[account.id] = account.smtp
          }
          return acc
        }, {}),
        defaults: {
          from: '"nest-modules" <modules@nestjs.com>',
        },
        template: {
          dir: __dirname + '/../../templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      },
    },
    jwt: {
      options: {
        secret: process.env.JWT_SECRET,
      },
    },
    crypt: {
      algorithm: 'aes-256-cbc',
      securityKey: process.env.CRYPT_SECURITYKEY
        ? createHash('sha256').update(String(process.env.CRYPT_SECURITYKEY)).digest('base64').substring(0, 32)
        : null,
      initVector: createHash('md5').update(String(process.env.CRYPT_SECURITYKEY)).digest('hex').substring(0, 16),
    },
    passport: {
      options: {
        defaultStrategy: 'jwt',
        property: 'user',
        session: false,
      },
      modules: {},
    },
    tokens,
    swagger: {
      path: '/swagger',
      api: '/swagger/json',
      options: {
        swaggerOptions: {
          persistAuthorization: true,
        },
      },
    },
  }
}
