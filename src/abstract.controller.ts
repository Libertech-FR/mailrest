import { ModuleRef } from '@nestjs/core'
import { AbstractService } from '~/abstract.service'

export abstract class AbstractController {
  protected abstract service?: AbstractService
  protected constructor(protected readonly moduleRef: ModuleRef) {}
}
