import { Controller, Get, HttpStatus, Param, ParseBoolPipe, Query, Res } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { AbstractController } from '~/_common/abstracts/abstract.controller'
import { CronService } from '~/accounts/cron/cron.service'
import { Response } from 'express'

@Controller('cron')
export class CronController extends AbstractController {
  public constructor(
    protected readonly moduleRef: ModuleRef,
    protected readonly service: CronService,
  ) {
    super(moduleRef)
  }

  @Get('run')
  public async runAll(
    @Res() res: Response,
    @Query('seq') seq: string,
    @Query('mailbox') mailbox?: string,
    @Query('sync', new ParseBoolPipe({ optional: true })) sync?: boolean,
    @Query('delete', new ParseBoolPipe({ optional: true })) deleteVar?: boolean,
  ): Promise<Response> {
    const data = await this.service.runAll(seq, {
      mailbox,
      sync,
      delete: deleteVar,
    })
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }

  @Get('run/:account([\\w-.]+)')
  public async runAccount(
    @Res() res: Response,
    @Param('account') account: string,
    @Query('seq') seq: string,
    @Query('mailbox') mailbox?: string,
    @Query('sync', new ParseBoolPipe({ optional: true })) sync?: boolean,
    @Query('delete', new ParseBoolPipe({ optional: true })) deleteVar?: boolean,
  ): Promise<Response> {
    const data = await this.service.runAccount(account, seq, {
      mailbox,
      sync,
      delete: deleteVar,
    })
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data,
    })
  }
}
