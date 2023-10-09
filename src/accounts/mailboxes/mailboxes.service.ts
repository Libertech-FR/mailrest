import { Injectable, NotFoundException } from '@nestjs/common'
import { AbstractService } from '~/_common/abstracts/abstract.service'
import { ModuleRef } from '@nestjs/core'
import { InjectImapflow } from '~/imapflow/imapflow.decorators'
import { ImapFlow, ListTreeResponse } from 'imapflow'

@Injectable()
export class MailboxesService extends AbstractService {
  public constructor(
    protected readonly moduleRef: ModuleRef,
    @InjectImapflow() protected imapflow: Map<string, () => Promise<ImapFlow>>,
  ) {
    super({ moduleRef })
  }

  public async search(account: string): Promise<ListTreeResponse[]> {
    if (!this.imapflow.has(account)) throw new NotFoundException(`Account ${account} not found`)
    const flow = await this.imapflow.get(account)()
    const tree = await flow.listTree()
    return tree.folders
  }

  //TODO: add other methods
}
