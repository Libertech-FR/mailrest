// noinspection TypeScriptValidateJSTypes

'use strict'

import { CommandFactory } from 'nest-commander'
import configInstance from '~/config'
import { AppModule } from '~/app.module'

(async (): Promise<void> => {
  try {
    const config = configInstance()
    const app = await CommandFactory.runWithoutClosing(AppModule, {
      logger: config.application.logger,
      errorHandler: (err) => {
        console.error(err)
        process.exit(1)
      },
    })
    await app.close()
  } catch (err) {
    console.error(err)
    process.exit(255)
  }
  process.exit(0)
})()
