import { ModuleRef } from '@nestjs/core'
import { Request } from "express";

export abstract class AbstractService {
  protected moduleRef: ModuleRef
  protected request?: Request & { user?: any }

  protected constructor(context: { moduleRef: ModuleRef; request?: Request & { user?: any } }) {
    this.moduleRef = context.moduleRef
    this.request = context.request
  }
}
