import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { FetchMessageObject, FetchQueryObject, ImapFlow, MailboxLockObject } from 'imapflow'
import { LRUCache } from 'lru-cache'
import { omit } from 'radash'
import { AbstractService } from '~/_common/abstracts/abstract.service'
import { InjectImapflow } from '~/imapflow/imapflow.decorators'
import { AccountsFileV1 } from '../accounts.setup'

const defaultSearchOptions = {
  limit: 10,
  skip: 0,
}

@Injectable()
export class MessagesService extends AbstractService {
  protected cache: LRUCache<string, AccountsFileV1>
  protected logger: Logger = new Logger(MessagesService.name)

  public constructor(
    protected readonly moduleRef: ModuleRef,
    @InjectImapflow() protected imapflow: Map<string, () => Promise<ImapFlow>>,
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

  public async search(
    account: string,
    options?: {
      mailbox?: string
      limit?: number
      skip?: number
    },
  ): Promise<[Partial<FetchMessageObject>[], number]> {
    const mailbox = options?.mailbox || 'INBOX'
    if (!this.imapflow.has(account)) throw new NotFoundException(`Account ${account} not found`)
    let total = 0
    const data = []
    options = { ...defaultSearchOptions, ...options }
    const flow = await this.imapflow.get(account)()
    let lock: MailboxLockObject
    try {
      lock = await flow.getMailboxLock(mailbox)
    } catch (e) {
      throw new NotFoundException(`Mailbox ${mailbox} not found`)
    }
    try {
      await flow.mailboxOpen(mailbox)
      const listMessages = await flow.search({ seq: '1:*' })
      total = listMessages.length
      const seq = [options.skip + 1, options.limit !== -1 ? options.skip + options.limit : '*'].join(':')
      const messages = flow.fetch(seq, {
        flags: true,
        envelope: true,
        uid: true,
      })
      for await (const message of messages) {
        data.push(omit(message, ['modseq']))
      }
    } finally {
      lock.release()
    }
    return [data, total]
  }

  public async read(
    account: string,
    uid: string,
    options?: {
      mailbox?: string
      query?: FetchQueryObject
    },
  ): Promise<Partial<FetchMessageObject>> {
    const mailbox = options?.mailbox || 'INBOX'
    if (!this.imapflow.has(account)) throw new NotFoundException(`Account ${account} not found`)
    let msg: Partial<FetchMessageObject>
    const flow = await this.imapflow.get(account)()
    let lock: MailboxLockObject
    try {
      lock = await flow.getMailboxLock(mailbox)
    } catch (e) {
      throw new NotFoundException(`Mailbox ${mailbox} not found`)
    }
    try {
      const message = await flow.fetchOne(
        uid,
        options?.query || {
          flags: true,
          envelope: true,
          bodyStructure: true,
          uid: true,
        },
      )
      msg = omit(message, ['modseq'])
    } finally {
      lock.release()
    }
    return msg
  }

  public async readSource(
    account: string,
    uid: string,
    options?: {
      mailbox?: string
    },
  ): Promise<Partial<FetchMessageObject>> {
    const mailbox = options?.mailbox || 'INBOX'
    return this.read(account, uid, {
      mailbox,
      query: {
        source: true,
        uid: true,
      },
    })
  }

  public async delete(
    account: string,
    uid: string,
    options?: {
      mailbox?: string
    },
  ): Promise<boolean> {
    const mailbox = options?.mailbox || 'INBOX'
    if (!this.imapflow.has(account)) throw new NotFoundException(`Account ${account} not found`)
    const flow = await this.imapflow.get(account)()
    let lock: MailboxLockObject
    try {
      lock = await flow.getMailboxLock(mailbox)
    } catch (e) {
      throw new NotFoundException(`Mailbox ${mailbox} not found`)
    }
    try {
      return await flow.messageDelete(uid)
    } finally {
      lock.release()
    }
  }
}
