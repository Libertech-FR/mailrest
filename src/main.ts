// noinspection JSUnresolvedReference

import { INestApplication, Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Response } from 'express'
import { json } from 'body-parser'
import { join } from 'path'
import configInstance from './config'
import { AppModule } from './app.module'
import passport from 'passport'
import 'multer'

declare const module: any
;(async (): Promise<void> => {
  console.log('Starting mailrest...')
  const config = await configInstance()
  const app = await NestFactory.create<NestExpressApplication & INestApplication>(AppModule, {
    logger: config.application.logger,
  })
  app.use((_, res: Response, next: () => void) => {
    res.removeHeader('x-powered-by')
    next()
  })
  app.use(passport.initialize())
  app.use(json({ limit: '50mb' }))
  app.useStaticAssets(join(__dirname, 'public'))
  app.setBaseViewsDir(join(__dirname, 'templates'))
  if (process.env.NODE_ENV !== 'production') {
    require('./swagger').default(app)
  }
  await app.listen(7200, (): void => {
    Logger.log('Mailrest is READY on <http://127.0.0.1:7200> !')
  })
  if (module.hot) {
    module.hot.accept()
    module.hot.dispose((): Promise<void> => app.close())
  }
})()
