import { Injectable, Logger } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { AbstractService } from '~/_common/abstracts/abstract.service'
import { InjectRedis, Redis } from '@nestjs-modules/ioredis'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService extends AbstractService {
  private readonly logger = new Logger(this.constructor.name)

  public constructor(
    protected moduleRef: ModuleRef,
    protected jwtService: JwtService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    super({ moduleRef })
  }
}
