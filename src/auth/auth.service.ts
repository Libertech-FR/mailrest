'use strict'

import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { AbstractService } from '~/common/abstract.service'
import { createHash, randomBytes } from 'crypto'
import { InjectRedis, Redis } from '@nestjs-modules/ioredis'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import { UserInterface } from '~/auth/ldap.interface'

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

  public async retrieveSession(id: string, token: string): Promise<{ user: UserInterface }> {
    const refreshKeyPath = AuthService.generateRefreshKeyPath(id, token)
    const session = await this.redis.get(refreshKeyPath)
    if (!session) {
      this.logger.debug(`Retrieve session error with id <${id}> and key <${token}>`)
      throw new UnauthorizedException()
    }
    return JSON.parse(session)
  }

  public async tokensDelivery(user: any, refreshToken?: string) {
    let refreshKey
    const subject = createHash('md5').update(user.dn).digest('hex')
    if (!refreshToken) {
      refreshToken = this.jwtService.sign({}, {
        subject,
        expiresIn: 60 * 60 * 4,
        jwtid: randomBytes(16).toString('hex'),
      } as JwtSignOptions)
      refreshKey = createHash('sha1').update(refreshToken).digest('hex')
      await this.redis.set(
        AuthService.generateRefreshKeyPath(subject, refreshKey),
        JSON.stringify({ user }),
        'EX', 60 * 60 * 4,
      )
    }
    if (!refreshKey) refreshKey = createHash('sha1').update(refreshToken).digest('hex')
    return {
      refreshToken,
      accessToken: this.jwtService.sign({ refreshKey }, {
        subject,
        expiresIn: 60 * 5,
      }),
    }
  }

  public async refresh(currentRefreshToken: string) {
    const refreshKey = createHash('sha1').update(currentRefreshToken).digest('hex')
    this.logger.debug(`Refresh attempt with key <${refreshKey || 'unknown'}>`)
    try {
      await this.jwtService.verifyAsync(currentRefreshToken)
    } catch (e) {
      throw new UnauthorizedException(`Fail to decode JWT: ${e}`)
    }
    const refreshToken = this.jwtService.decode(currentRefreshToken)
    if (typeof refreshToken !== 'object') throw new BadRequestException()
    const refreshKeyPath = AuthService.generateRefreshKeyPath(refreshToken.sub, refreshKey)
    const session = await this.redis.get(refreshKeyPath)
    try {
      const payload = JSON.parse(session)
      if (await this.redis.ttl(refreshKeyPath) < 60) {
        currentRefreshToken = null
        await this.redis.del(refreshKeyPath)
      }
      return await this.tokensDelivery(payload.user, currentRefreshToken)
    } catch (e) {
      throw new UnauthorizedException(`Fail to parse session: ${e}`)
    }
  }

  public async clearSession(id: string, refreshKey: string) {
    try {
      await this.redis.del(AuthService.generateRefreshKeyPath(id, refreshKey))
    } finally {
    }
  }

  public static generateRefreshKeyPath(id: string, refreshKey: string): string {
    return [
      'auth', 'user', id, 'refresh', refreshKey,
    ].join('.')
  }
}
