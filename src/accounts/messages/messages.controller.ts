import { Controller, Delete, Get, Header, HttpStatus, Param, Query, Res } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { AbstractController } from '~/_common/abstracts/abstract.controller'
import { MessagesSearchQueryDto } from './_dto/messages-search-query.dto'
import { MessagesService } from './messages.service'
import { Response } from 'express'
import { Readable } from 'stream'
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { UseRoles } from 'nest-access-control'
import { ScopesEnum } from '~/_common/enums/scopes.enum'
import { ActionEnum } from '~/_common/enums/action.enum'
import { ApiReadResponseDecorator } from '~/_common/decorators/api-read-response.decorator'
import { FetchMessageDto } from '~/accounts/messages/_dto/fetch-message.dto'
import { ApiDeletedResponseDecorator } from '~/_common/decorators/api-deleted-response.decorator'
import { ApiPaginatedDecorator } from '~/_common/decorators/api-paginated.decorator'

@ApiTags('messages')
@Controller(':account([\\w-.]+)/messages')
export class MessagesController extends AbstractController {
  public constructor(
    protected readonly moduleRef: ModuleRef,
    protected readonly service: MessagesService,
  ) {
    super(moduleRef)
  }

  @Get()
  @UseRoles({
    resource: ScopesEnum.Accounts,
    action: ActionEnum.Read,
  })
  @ApiPaginatedDecorator(MessagesSearchQueryDto)
  @ApiQuery({ name: 'mailbox', required: false })
  public async search(@Res() res: Response, @Param('account') account: string, @Query() query: MessagesSearchQueryDto): Promise<Response> {
    const [data, total] = await this.service.search(account, query)
    return res.json({
      statusCode: HttpStatus.OK,
      data,
      total,
    })
  }

  @Get(':message([\\w-.]+)')
  @UseRoles({
    resource: ScopesEnum.Accounts,
    action: ActionEnum.Read,
  })
  @ApiReadResponseDecorator(FetchMessageDto)
  @ApiQuery({ name: 'mailbox', required: false })
  public async read(
    @Res() res: Response,
    @Param('account') account: string,
    @Param('message') message: string,
    @Query('mailbox') mailbox?: string,
  ): Promise<Response> {
    const data = await this.service.read(account, message, {
      mailbox,
    })
    return res.json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Get(':message([\\w-.]+)/source')
  @UseRoles({
    resource: ScopesEnum.Accounts,
    action: ActionEnum.Read,
  })
  @Header('Content-Type', 'message/eml')
  @Header('Content-Disposition', 'attachment; filename="source.eml"')
  @ApiQuery({ name: 'mailbox', required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The source of the message',
    type: String,
  })
  public async source(
    @Res() res: Response,
    @Param('account') account: string,
    @Param('message') message: string,
    @Query('mailbox') mailbox?: string,
  ): Promise<void> {
    const eml = await this.service.readSource(account, message, {
      mailbox,
    })
    Readable.from(eml.source).pipe(res)
  }

  @Delete(':message([\\w-.]+)')
  @UseRoles({
    resource: ScopesEnum.Accounts,
    action: ActionEnum.Delete,
  })
  @ApiDeletedResponseDecorator(null, {
    schema: {
      properties: {
        statusCode: {
          type: 'number',
          enum: [HttpStatus.OK],
        },
        deleted: {
          type: 'boolean',
        },
      },
    },
  })
  @ApiQuery({ name: 'mailbox', required: false })
  public async delete(
    @Res() res: Response,
    @Param('account') account: string,
    @Param('message') message: string,
    @Query('mailbox') mailbox: string,
  ): Promise<Response> {
    const deleted = await this.service.delete(account, message, {
      mailbox,
    })
    return res.json({
      statusCode: HttpStatus.OK,
      deleted,
    })
  }
}
