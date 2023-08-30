import { BadRequestException, Body, Controller, Delete, Get, HttpException, Logger, Param, Patch, Post, Res, Sse } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { Response } from 'express'
import { AbstractController } from '~/abstract.controller'
import { FSWatcher, watch } from 'fs'
import { Observable } from 'rxjs'
import { AccountsService } from './accounts.service'
import { ACCOUNTS_FILE_PATH, AccountsMetadataV1, readAccountsFile } from './accounts.setup'

@Controller('accounts')
export class AccountsController extends AbstractController {
  public constructor(protected readonly moduleRef: ModuleRef, protected readonly service: AccountsService) {
    super(moduleRef)
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

  @Get()
  public async search(@Res() res: Response): Promise<Response> {
    const data = await this.service.search()
    return res.json(data)
  }

  @Post()
  public async create(@Res() res: Response, @Body() data: AccountsMetadataV1): Promise<Response> {
    try {
      const account = await this.service.create(data)
      return res.json({ account })
    } catch (error) {
      throw error instanceof HttpException ? error : new BadRequestException(error.message, error)
    }
  }

  @Get(':account([\\w-.]+)')
  public async read(@Res() res: Response, @Param('account') id: string): Promise<Response> {
    try {
      const data = await this.service.read(id) // TODO: 404
      return res.json({ data })
    } catch (error) {
      throw error instanceof HttpException ? error : new BadRequestException(error.message, error)
    }
  }

  @Patch(':account([\\w-.]+)')
  public async update(@Res() res: Response, @Param('account') id: string, @Body() data: AccountsMetadataV1): Promise<Response> {
    try {
      const account = await this.service.update(id, data) // TODO: 404
      return res.json({ account })
    } catch (error) {
      throw error instanceof HttpException ? error : new BadRequestException(error.message, error)
    }
  }

  @Delete(':account([\\w-.]+)')
  public async delete(@Res() res: Response, @Param('account') id: string): Promise<Response> {
    try {
      const account = await this.service.delete(id) // TODO: 404
      return res.json({ account })
    } catch (error) {
      throw error instanceof HttpException ? error : new BadRequestException(error.message, error)
    }
  }
}
