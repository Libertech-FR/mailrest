import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { ImapFlow } from 'imapflow'
import { LRUCache } from 'lru-cache'
import { AbstractService } from '~/_common/abstracts/abstract.service'
import { InjectImapflow } from '~/imapflow/imapflow.decorators'
import { AccountsFileV1, AccountsMetadataV1, readAccountsFile, writeAccountsFile } from './accounts.setup'
import { PartialType } from '@nestjs/swagger'
import { MailerService } from '@nestjs-modules/mailer'
import { AccountSubmitDto } from '~/accounts/_dto/account-submit.dto'

class InternalAccountMetadataV1 extends PartialType(AccountsMetadataV1) {
}

@Injectable()
export class AccountsService extends AbstractService {
  protected cache: LRUCache<string, AccountsFileV1>
  protected logger: Logger = new Logger(AccountsService.name)

  public constructor(
    protected readonly moduleRef: ModuleRef,
    @InjectImapflow() protected imapflow: Map<string, ImapFlow>,
    private readonly mailerService: MailerService,
  ) {
    super({ moduleRef })
    // noinspection JSUnusedGlobalSymbols
    this.cache = new LRUCache({
      max: 100,
      maxSize: 1000,
      sizeCalculation: () => 1,
      ttl: 1000 * 60 * 5,
    })
  }

  public async search(): Promise<InternalAccountMetadataV1[]> {
    const data = await readAccountsFile(this.cache)
    return data.accounts
  }

  public async create(data: InternalAccountMetadataV1): Promise<InternalAccountMetadataV1> {
    const accounts = await readAccountsFile(this.cache)
    const account = new AccountsMetadataV1()
    Object.assign(account, data)
    accounts.accounts.push(account)
    await writeAccountsFile(accounts, this.cache)
    return account
  }

  public async read(id: string): Promise<InternalAccountMetadataV1> {
    const data = await readAccountsFile(this.cache)
    const account = data.accounts.find((a) => a.id === id)
    if (!account) {
      throw new NotFoundException(`Account not found: ${id}`)
    }
    return account
  }

  public async update(id: string, data: InternalAccountMetadataV1): Promise<InternalAccountMetadataV1> {
    const accounts = await readAccountsFile(this.cache)
    const account = accounts.accounts.find((a) => a.id === id)
    if (!account) {
      throw new NotFoundException(`Account not found: ${id}`)
    }
    Object.assign(account, data)
    await writeAccountsFile(accounts, this.cache)
    return account
  }

  public async delete(id: string): Promise<InternalAccountMetadataV1> {
    const accounts = await readAccountsFile(this.cache)
    const account = accounts.accounts.find((a) => a.id === id)
    if (!account) {
      throw new NotFoundException(`Account not found: ${id}`)
    }
    accounts.accounts = accounts.accounts.filter((a) => a.id !== id)
    await writeAccountsFile(accounts, this.cache)
    return account
  }

  public async submit(id: string, body: AccountSubmitDto, files?: Express.Multer.File[]) {
    const accounts = await readAccountsFile(this.cache)
    const account = accounts.accounts.find((a) => a.id === id)
    if (!account) throw new NotFoundException(`Account not found: ${id}`)
    return this.mailerService.sendMail({
      ...body,
      attachments: files,
      from: account.smtp.from || account.smtp.auth.user,
      transporterName: id,
    })
  }
}
