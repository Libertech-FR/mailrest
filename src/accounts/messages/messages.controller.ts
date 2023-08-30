import { Controller, Get, Param, Query } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { AbstractController } from '~/abstract.controller'
import { MessagesSearchQueryDto } from './messages.dto'
import { MessagesService } from './messages.service'

@Controller(':account([\\w-.]+)/messages')
export class MessagesController extends AbstractController {
  public constructor(protected readonly moduleRef: ModuleRef, protected readonly service: MessagesService) {
    super(moduleRef)
  }

  @Get()
  public async search(@Param('account') account: string, @Query() query: MessagesSearchQueryDto) {
    const mailbox = query.mailbox
    delete query.mailbox
    return this.service.search(account, mailbox, query)
  }

  @Get(':message([\\w-.]+)')
  public async read(@Param('account') account: string, @Param('message') message: string, @Query('mailbox') mailbox: string) {
    return this.service.read(account, mailbox, message)
  }
}
