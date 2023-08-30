import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { ImapFlow } from 'imapflow'
import { find, pick } from 'lodash'
import { LRUCache } from 'lru-cache'
import { AbstractService } from '~/abstract.service'
import { InjectImapflow } from '~/imapflow/imapflow.decorators'
import { AccountsFileV1, AccountsMetadataV1, readAccountsFile, writeAccountsFile } from './accounts.setup'

@Injectable()
export class AccountsService extends AbstractService {
  protected cache: LRUCache<string, AccountsFileV1>
  protected logger: Logger = new Logger(AccountsService.name)
  public constructor(protected readonly moduleRef: ModuleRef, @InjectImapflow() protected imapflow: Map<string, ImapFlow>) {
    super({ moduleRef })
    this.cache = new LRUCache({
      max: 100,
      maxSize: 1000,
      sizeCalculation: () => 1,
      ttl: 1000 * 60 * 5,
    })
  }

  public async search(): Promise<Partial<AccountsFileV1>> {
    const data = await readAccountsFile(this.cache)
    return pick(data, ['accounts'])
  }

  public async create(data: Partial<AccountsMetadataV1>): Promise<Partial<AccountsMetadataV1>> {
    const accounts = await readAccountsFile(this.cache)
    const account = new AccountsMetadataV1()
    Object.assign(account, data)
    accounts.accounts.push(account)
    await writeAccountsFile(accounts, this.cache)
    return account
  }

  public async read(id: string): Promise<Partial<AccountsMetadataV1>> {
    const data = await readAccountsFile(this.cache)
    const account = find(data.accounts, { id })
    if (!account) {
      throw new NotFoundException(`Account not found: ${id}`)
    }
    return account
  }

  public async update(id: string, data: Partial<AccountsMetadataV1>): Promise<Partial<AccountsMetadataV1>> {
    const accounts = await readAccountsFile(this.cache)
    const account: AccountsMetadataV1 = find(accounts.accounts, { id })
    if (!account) {
      throw new NotFoundException(`Account not found: ${id}`)
    }
    Object.assign(account, data)
    await writeAccountsFile(accounts, this.cache)
    return account
  }

  public async delete(id: string): Promise<Partial<AccountsMetadataV1>> {
    const accounts = await readAccountsFile(this.cache)
    const account = find(accounts.accounts, { id })
    if (!account) {
      throw new NotFoundException(`Account not found: ${id}`)
    }
    accounts.accounts = accounts.accounts.filter((a) => a.id !== id)
    await writeAccountsFile(accounts, this.cache)
    return account
  }
}
