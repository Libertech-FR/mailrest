'use strict'

import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Response } from 'express'
import { BadRequestException, Logger, UsePipes, ValidationPipe } from '@nestjs/common'
import { join } from 'path'
import configInstance from '~/config'

declare const module: any

(async (): Promise<void> => {
  const config = configInstance()
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: config.application.logger,
  })

  app.useGlobalPipes(new ValidationPipe({ transform: true, exceptionFactory: (errors) => {
      const err = {}
      errors.forEach(error => {
        Object.values(error.constraints).forEach(value => {
          err[error.property] = value
        })
      })
      return new BadRequestException({
        error:"Bad Request",
        message: err,
        statusCode: 400
      })
    }}))

  app.use((_, res: Response, next: Function) => {
    res.removeHeader('x-powered-by')
    next()
  })
  app.useStaticAssets(join(__dirname, 'public'))

  await app.listen(4000, (): void => {
    Logger.log('MyReport is READY on <http://127.0.0.1:4000> !')
  })

  if (module.hot) {
    module.hot.accept()
    module.hot.dispose((): Promise<void> => app.close())
  }
})()
