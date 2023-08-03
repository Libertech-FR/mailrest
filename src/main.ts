import { Logger, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Response } from 'express'
import { json } from 'body-parser'
import { join } from 'path'
import configInstance from '~/config'
import { AppModule } from './app.module'
import passport from 'passport'
import setupAccounts from './accounts/accounts.setup'

declare const module: any
;(async (): Promise<void> => {
  const config = configInstance()
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: config.application.logger,
  })
  await setupAccounts()
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })
  app.use((_, res: Response, next: () => void) => {
    res.removeHeader('x-powered-by')
    next()
  })
  app.use(passport.initialize())
  app.use(json({ limit: '50mb' }))
  app.useStaticAssets(join(__dirname, 'public'))
  app.setBaseViewsDir(join(__dirname, 'templates'))
  if (process.env.production !== 'production') {
    require('./swagger').default(app)
  }
  await app.listen(7000, (): void => {
    Logger.log('Mailrest is READY on <http://127.0.0.1:7000> !')
  })
  if (module.hot) {
    module.hot.accept()
    module.hot.dispose((): Promise<void> => app.close())
  }
})()
