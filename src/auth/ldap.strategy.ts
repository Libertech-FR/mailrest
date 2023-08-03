'use strict'

import Strategy from 'passport-ldapauth'
import { PassportStrategy } from '@nestjs/passport'
import { ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { AuthService } from '~/auth/auth.service'
import { ConfigService } from '@nestjs/config'
import { UserInterface } from '~/auth/ldap.interface'
import { CipherCCMTypes, CipherGCMTypes, createCipheriv } from 'crypto'
import { isArray } from 'lodash'

@Injectable()
export class LdapStrategy extends PassportStrategy(Strategy, 'ldap') {
  private readonly logger = new Logger(this.constructor.name)

  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {
    super({
      ...config.get('passport.modules.ldap'),
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true,
    })
  }

  public authenticate(req: Request, options?: Strategy.AuthenticateOptions): void {
    this.logger.debug(`Authentication attempt with <${req?.body?.username || 'unknown'}>`)
    return super.authenticate(req, options)
  }

  // noinspection JSUnusedGlobalSymbols
  public async validate(req: Request, user: UserInterface, done) {
    console.log(user)
    let err = null
    if (!user) err = new UnauthorizedException()
    if (!isArray(user.memberOf)) { // @ts-ignore
      user.memberOf = [user.memberOf]
    }
    // let memberOfAdmin = false
    // for (const mOf of user.memberOf) {
    //   if (/^cn=admin,.*/.test(mOf)) memberOfAdmin = true
    // }
    // if (!memberOfAdmin) err = new ForbiddenException()
    // const cipher = createCipheriv(
    //   this.config.get<string | CipherCCMTypes | CipherGCMTypes>('crypt.algorithm'),
    //   this.config.get<Buffer>('crypt.securityKey'),
    //   this.config.get<Buffer>('crypt.initVector'),
    // )
    // const encryptPart = cipher.update(req?.body?.password, 'utf-8')

    return done(err, {
      ...user,
      // cryptpasswd: Buffer.concat([
      //   encryptPart,
      //   cipher.final(),
      // ]).toString('hex'),
    })
  }
}
