import { Controller, Get, Inject, Res } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { ClientProxy } from '@nestjs/microservices'
import { Response } from 'express'
import { AppService } from './app.service'

@Controller()
export class AppController {
  public constructor(
    protected readonly moduleRef: ModuleRef,
    protected readonly service: AppService,
    @Inject('TEST_SERVICE') private client: ClientProxy,
  ) {}

  @Get()
  public getInfo(@Res() res: Response): Response {
    return res.json({
      ...this.service.getInfo(),
    })
  }

  @Get('test')
  public test() {
    return this.client.send('test2', { tarte: 'test' })
  }
}
