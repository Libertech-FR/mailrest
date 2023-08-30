import { Injectable, Logger } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { FetchMessageObject, ImapFlow, MailboxObject } from 'imapflow'
import { LRUCache } from 'lru-cache'
import { omit, pick } from 'radash'
import { AbstractService } from '~/abstract.service'
import { InjectImapflow } from '~/imapflow/imapflow.decorators'
import { AccountsFileV1 } from '../accounts.setup'

const defaultSearchOptions = {
  limit: 10,
  offset: 0,
}

export interface SearchOptions {
  limit?: number
  offset?: number
}

@Injectable()
export class MessagesService extends AbstractService {
  protected cache: LRUCache<string, AccountsFileV1>
  protected logger: Logger = new Logger(MessagesService.name)
  public constructor(protected readonly moduleRef: ModuleRef, @InjectImapflow() protected imapflow: Map<string, ImapFlow>) {
    super({ moduleRef })
    this.cache = new LRUCache({
      max: 100,
      maxSize: 1000,
      sizeCalculation: () => 1,
      ttl: 1000 * 60 * 5,
    })
  }

  public async search(account: string, mailbox: string, options?: SearchOptions): Promise<Partial<FetchMessageObject>[]> {
    const data = []
    options = { ...defaultSearchOptions, ...options }
    const lock = await this.imapflow.get(account).getMailboxLock(mailbox)
    this.imapflow.get(account).mailboxOpen(mailbox)
    try {
      const seq = [options.offset + 1, options.limit !== -1 ? options.offset + options.limit : '*'].join(':')
      console.log('seq', seq)
      console.log('options', options)
      const messages = await this.imapflow.get(account).fetch(seq, {
        flags: true,
        envelope: true,
        bodyStructure: true,
        uid: true,
      })
      for await (const message of messages) {
        data.push(omit(message, ['modseq']))
      }
    } finally {
      lock.release()
    }
    return data
  }

  public async read(account: string, mailbox: string, uid: string): Promise<Partial<FetchMessageObject>> {
    let msg
    const lock = await this.imapflow.get(account).getMailboxLock(mailbox)
    try {
      const mb = this.imapflow.get(account).mailbox as MailboxObject
      const message = await this.imapflow.get(account).fetchOne('' + mb.exists, {
        flags: true,
        envelope: true,
        bodyStructure: true,
        uid: true,
      })
      msg = omit(message, ['modseq'])
    } finally {
      lock.release()
    }
    return msg
  }
}
