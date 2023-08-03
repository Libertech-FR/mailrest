import { ModuleRef } from '@nestjs/core'
// import { AbstractSchema } from '~/common/abstract.schema'

export abstract class AbstractService {
  protected moduleRef: ModuleRef
  protected request?: Request & { user?: any }
  // protected abstract _model: Model<Document | any>

  protected constructor(context: { moduleRef: ModuleRef; request?: Request & { user?: any } }) {
    this.moduleRef = context.moduleRef
    this.request = context.request
  }
}
