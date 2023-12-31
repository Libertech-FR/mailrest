import { ConfigService } from '@nestjs/config'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { SwaggerTheme } from 'swagger-themes'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Logger } from '@nestjs/common'

export const SWAGGER_TMP_FILE_PATH = resolve('./packages/sdk/assets/swagger.json')

export default function (app: NestExpressApplication) {
  const config = app.get<ConfigService>(ConfigService)
  const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
  const build = new DocumentBuilder()
    .setTitle(pkg.name)
    .setDescription(pkg.description)
    .setVersion(pkg.version)
    .addBasicAuth()
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .build()
  const document = SwaggerModule.createDocument(app, build)
  const theme = new SwaggerTheme('v3')
  SwaggerModule.setup(config.get<string>('swagger.path'), app, document, {
    ...config.get<SwaggerCustomOptions>('swagger.options'),
    explorer: true,
    swaggerOptions: {},
    customCss: theme.getBuffer('dark'),
  })
  Logger.debug(`Writing swagger.json to disk... <${SWAGGER_TMP_FILE_PATH}>`)
  writeFileSync(SWAGGER_TMP_FILE_PATH, JSON.stringify(document, null, 2))
  app.getHttpAdapter().get(config.get<string>('swagger.api'), (req: Request, res: Response) => res.json(document))
}
