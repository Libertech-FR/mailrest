import { Body, Controller, Delete, Get, HttpStatus, Logger, Param, Patch, Post, Res, Sse } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { Response } from 'express'
import { AbstractController } from '~/_common/abstracts/abstract.controller'
import { FSWatcher, watch } from 'fs'
import { Observable } from 'rxjs'
import { AccountsService } from './accounts.service'
import { ACCOUNTS_FILE_PATH, AccountsMetadataV1, readAccountsFile } from './accounts.setup'
import { UseRoles } from 'nest-access-control'
import { ScopesEnum } from '~/_common/enums/scopes.enum'
import { ActionEnum } from '~/_common/enums/action.enum'
import { ApiCreateDecorator } from '~/_common/decorators/api-create.decorator'
import { ApiSimpleSearchDecorator } from '~/_common/decorators/api-simple-search.decorator'
import { ApiReadResponseDecorator } from '~/_common/decorators/api-read-response.decorator'
import { ApiUpdateDecorator } from '~/_common/decorators/api-update.decorator'
import { ApiDeletedResponseDecorator } from '~/_common/decorators/api-deleted-response.decorator'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController extends AbstractController {
  public constructor(
    protected readonly moduleRef: ModuleRef,
    protected readonly service: AccountsService,
  ) {
    super(moduleRef)
  }

  @Get()
  @UseRoles({
    resource: ScopesEnum.Accounts,
    action: ActionEnum.Read,
  })
  @ApiSimpleSearchDecorator(AccountsMetadataV1)
  public async search(@Res() res: Response): Promise<Response> {
    const data = await this.service.search()
    return res.json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Post()
  @UseRoles({
    resource: ScopesEnum.Accounts,
    action: ActionEnum.Create,
  })
  @ApiCreateDecorator(AccountsMetadataV1, AccountsMetadataV1)
  public async create(@Res() res: Response, @Body() body: AccountsMetadataV1): Promise<Response> {
    const data = await this.service.create(body)
    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data,
    })
  }

  @Get(':account([\\w-.]+)')
  @UseRoles({
    resource: ScopesEnum.Accounts,
    action: ActionEnum.Read,
  })
  @ApiReadResponseDecorator(AccountsMetadataV1)
  public async read(@Res() res: Response, @Param('account') id: string): Promise<Response> {
    const data = await this.service.read(id)
    return res.json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Patch(':account([\\w-.]+)')
  @UseRoles({
    resource: ScopesEnum.Accounts,
    action: ActionEnum.Update,
  })
  @ApiUpdateDecorator(AccountsMetadataV1, AccountsMetadataV1)
  public async update(@Res() res: Response, @Param('account') id: string, @Body() body: AccountsMetadataV1): Promise<Response> {
    const data = await this.service.update(id, body)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Delete(':account([\\w-.]+)')
  @UseRoles({
    resource: ScopesEnum.Accounts,
    action: ActionEnum.Delete,
  })
  @ApiDeletedResponseDecorator(AccountsMetadataV1)
  public async delete(@Res() res: Response, @Param('account') id: string): Promise<Response> {
    const data = await this.service.delete(id)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Sse('changes')
  public async sse(@Res() res: Response): Promise<Observable<MessageEvent>> {
    let subscriber: FSWatcher
    res.socket.on('close', () => {
      if (subscriber) {
        subscriber.close()
        Logger.debug(`Observer close connection from SSE<changes>`, this.constructor.name)
      }
    })
    return new Observable((observer) => {
      subscriber = watch(ACCOUNTS_FILE_PATH, async () => {
        const data = await readAccountsFile()
        observer.next({ data } as MessageEvent)
      })
    })
  }
}
