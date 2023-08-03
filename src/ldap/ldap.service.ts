import { Inject, Injectable, LoggerService, Scope } from '@nestjs/common'
import { Client, createClient, SearchEntryObject, SearchOptions } from 'ldapjs-promise'
import { AsyncConstructor } from 'async-constructor'
import { LDAP_OPTIONS, LdapModuleOptions } from '~/ldap/ldap.interface'
import { Change, Control } from 'ldapjs'
import { REQUEST } from '@nestjs/core'
import { Request } from 'express'
import { CipherCCMTypes, CipherGCMTypes, createDecipheriv } from 'crypto'
import { ConfigService } from '@nestjs/config'

function NormalizeOptions(options: SearchOptions): SearchOptions {
  return {
    scope: 'sub',
    // sizeLimit: 999,
    ...options,
  }
}

@Injectable({ scope: Scope.REQUEST })
export class LdapService extends AsyncConstructor {
  protected logger: LoggerService
  private _client: Client
  private initialized = false

  public constructor(
    private readonly config: ConfigService,
    @Inject(REQUEST) protected req: Request & { user: any },
    @Inject(LDAP_OPTIONS) private readonly options: LdapModuleOptions,
  ) {
    super(async () => {
      this.logger = options.logger
      this._client = await createClient(options.client)
    })
  }

  public get client(): Client {
    if (!this.initialized) {
      ;(async () => {
        this.initialized = true
        const decipher = createDecipheriv(
          this.config.get<string | CipherCCMTypes | CipherGCMTypes>('crypt.algorithm'),
          this.config.get<Buffer>('crypt.securityKey'),
          this.config.get<Buffer>('crypt.initVector'),
        )
        const decrypted = decipher.update(this.req.user.cryptpasswd, 'hex', 'utf-8')
        await this._client.bind(this.req.user.dn, decrypted + decipher.final())
      })()
    }
    return this._client
  }

  public async searchReturnAll(base: string, options?: SearchOptions, controls?: Control | Array<Control>) {
    this.logger.debug(`Send ldapsearch base <${base}> with filters <${options?.filter}>`)
    return await this.client.searchReturnAll(base, NormalizeOptions(options), controls)
  }

  public async add(dn: string, entry: Object, controls?: Control | Array<Control>) {
    this.logger.debug(`Send ldapadd base <${dn}> with filters <${JSON.stringify(entry)}>`)
    await this.client.add(dn, entry, controls)
    return (await this.client.searchReturnAll(dn)).entries[0]
  }

  public async del(dn: string, controls?: Control | Array<Control>): Promise<void> {
    this.logger.debug(`Send ldapdel base <${dn}>`)
    await this.client.del(dn, controls)
  }

  public async modify(
    dn: string,
    change: Change | Array<Change>,
    controls?: Control | Array<Control>,
  ): Promise<SearchEntryObject> {
    this.logger.debug(`Send ldapmodify base <${dn}> with filters <${JSON.stringify(change)}>`)
    await this.client.modify(dn, change, controls)
    return (await this.client.searchReturnAll(dn)).entries[0]
  }

  // noinspection JSUnusedGlobalSymbols
  public async getSchema(options?: SearchOptions, controls?: Control | Array<Control>): Promise<any> {
    return (
      await this.client.searchReturnAll(
        'cn=schema',
        {
          ...options,
          scope: 'base',
        },
        controls,
      )
    ).entries[0]
  }
}
