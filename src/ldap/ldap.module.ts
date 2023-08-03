import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common'
import { LdapModuleAsyncOptions, LdapModuleOptions, LdapOptionsFactory, LDAP_OPTIONS } from '~/ldap/ldap.interface'
import { LdapService } from './ldap.service'

@Global()
@Module({
  imports: [],
  providers: [LdapService],
  exports: [LdapService],
})
export class LdapModule {
  // noinspection JSUnusedGlobalSymbols
  static register(options: LdapModuleOptions): DynamicModule {
    return {
      module: LdapModule,
      providers: [{ provide: LDAP_OPTIONS, useValue: options || {} }, LdapService],
    }
  }

  // noinspection JSUnusedGlobalSymbols
  static registerAsync(options: LdapModuleAsyncOptions): DynamicModule {
    return {
      module: LdapModule,
      imports: options.imports || [],
      providers: this.createAsyncProviders(options),
    }
  }

  private static createAsyncProviders(options: LdapModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)]
    }

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass as Type<LdapOptionsFactory>,
        useClass: options.useClass as Type<LdapOptionsFactory>,
      },
    ]
  }

  private static createAsyncOptionsProvider(options: LdapModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: LDAP_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    return {
      provide: LDAP_OPTIONS,
      useFactory: async (optionsFactory: LdapOptionsFactory) => optionsFactory.createLdapOptions(),
      inject: [(options.useExisting as Type<LdapOptionsFactory>) || (options.useClass as Type<LdapOptionsFactory>)],
    }
  }
}
