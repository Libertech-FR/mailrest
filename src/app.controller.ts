import { Controller, Get, Res, VERSION_NEUTRAL } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { Response } from 'express'
import { AppService } from './app.service'

@Controller({
  version: VERSION_NEUTRAL,
})
export class AppController {
  public constructor(
    protected readonly moduleRef: ModuleRef,
    protected readonly service: AppService,
  ) {}

  @Get()
  public getInfo(@Res() res: Response): Response {
    let devInfos = {}
    if (process.env.NODE_ENV !== 'production') {
      devInfos = {
        ...devInfos,
        ...this.service.getDevInfos(),
      }
    }
    return res.json({
      ...this.service.getInfo(),
      devInfos,
    })
  }
}
