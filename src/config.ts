'use strict'

import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface'
import { LogLevel } from '@nestjs/common'
import { MongooseModuleOptions } from '@nestjs/mongoose'
import { RedisOptions } from 'ioredis'
import { ClientOptions } from 'ldapjs'
import { JwtModuleOptions } from '@nestjs/jwt'
import { IAuthModuleOptions } from '@nestjs/passport'
import { BinaryLike, CipherCCMTypes, CipherGCMTypes, CipherKey, createHash } from 'crypto'
import bunyan from 'bunyan'
import { LogLevelString } from 'bunyan'
import bformat from 'bunyan-format'
import { Options as LdapPassportOptions } from 'passport-ldapauth'



export interface MongooseConfigInstance {
  uri: string
  options: MongooseModuleOptions
}

export interface IoredisConfigInstance {
  uri: string
  options: RedisOptions
}

export interface ConfigInstance {
  application: NestApplicationContextOptions
  ioredis: IoredisConfigInstance
  crypt: CryptConfigInstance
  ldap: LdapConfigInstance
  jwt: JwtConfigInstance
  passport: PassportConfigInstance
  mongoose: MongooseConfigInstance
}

export interface JwtConfigInstance {
  options: JwtModuleOptions
}

export interface CryptConfigInstance {
  algorithm: string | CipherCCMTypes | CipherGCMTypes
  securityKey: CipherKey
  initVector: BinaryLike
}

export interface PassportConfigInstance {
  options: IAuthModuleOptions
  modules?: {
    [key: string]: any
  }
}

export interface LdapConfigInstance {
  client: ClientOptions
  options: LdapOptionsConfig
}

export interface LdapOptionsConfig {
  searchBase: string
}

const defaultsFrom: string = '"test" <test@test.com>'

export default (): ConfigInstance => {
  const ldapSearchAttributes = ['uid', 'cn', 'mail', 'o', 'memberOf']
  const ldapLogger = bunyan.createLogger({
    name: 'LDAP',
    level: process.env.NODE_ENV === 'development'
      ? process.env.LDAP_LOG_LEVEL as LogLevelString || 'info'
      : 'info',
    stream: bformat({ outputMode: 'short' }),
  })
  return {
    application: {
      logger: process.env.LOGGER
        ? (process.env.LOGGER.split(',') as LogLevel[])
        : process.env.NODE_ENV === 'development'
          ? ['error', 'warn', 'log', 'debug']
          : ['error', 'warn', 'log'],
    },
    mongoose: {
      uri: process.env.MONGOOSE_URL,
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
    ioredis: {
      uri: process.env.IOREDIS_URL,
      options: {
        showFriendlyErrorStack: true,
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
        ? createHash('sha256')
          .update(String(process.env.CRYPT_SECURITYKEY))
          .digest('base64').substring(0, 32)
        : null,
      initVector: createHash('md5')
        .update(String(process.env.CRYPT_SECURITYKEY))
        .digest('hex').substring(0, 16),
    },
    passport: {
      options: {
        defaultStrategy: 'jwt',
        property: 'user',
        session: false,
      },
      modules: {
        ldap: {
          server: {
            url: process.env.PASSPORT_LDAP_URL,
            bindDN: process.env.PASSPORT_LDAP_BINDDN,
            bindCredentials: process.env.PASSPORT_LDAP_BINDCREDENTIALS,
            searchBase: process.env.PASSPORT_LDAP_SEARCHBASE,
            searchFilter: process.env.PASSPORT_LDAP_SEARCHFILTERS || '(&(uid={{username}}))',
            searchAttributes: process.env.PASSPORT_LDAP_SEARCHATTRIBUTES
              ? [...ldapSearchAttributes, ...process.env.PASSPORT_LDAP_SEARCHATTRIBUTES.split(',')]
              : ldapSearchAttributes,
            searchScope: 'sub',
            log: ldapLogger,
          },
        } as LdapPassportOptions,
      },
    },
    ldap: {
      client: {
        url: process.env.LDAP_URL || process.env.PASSPORT_LDAP_URL,
        log: ldapLogger,
      },
      options: {
        searchBase: process.env.LDAP_SEARCHBASE || process.env.PASSPORT_LDAP_SEARCHBASE,
      },
    },
  }
}
