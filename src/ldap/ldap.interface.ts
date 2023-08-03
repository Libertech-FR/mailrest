import { LoggerService } from '@nestjs/common'
import { ModuleMetadata, Type } from '@nestjs/common/interfaces'
import { ClientOptions } from 'ldapjs'

export const LDAP_OPTIONS = 'LDAP_OPTIONS'

export interface LdapModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<LdapOptionsFactory>
  useClass?: Type<LdapOptionsFactory>
  useFactory?: (...args: any[]) => Promise<LdapModuleOptions> | LdapModuleOptions
  inject?: any[]
}

export interface LdapOptionsFactory {
  createLdapOptions(): Promise<LdapModuleOptions> | LdapModuleOptions
}

export interface LdapModuleOptions {
  client: ClientOptions
  logger: LoggerService
}
