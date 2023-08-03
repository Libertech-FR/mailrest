import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly auth: AuthService, private readonly config: ConfigService) {
    super({
      secretOrKey: config.get<string>('jwt.options.secret'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
    })
  }

  // noinspection JSUnusedGlobalSymbols
  public async validate(payload: any, done: VerifiedCallback): Promise<void> {
    const session = await this.auth.retrieveSession(`${payload?.sub}`, `${payload?.refreshKey}`)
    return done(null, session.user)
  }
}
