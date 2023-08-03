import { InjectRedis, Redis } from '@nestjs-modules/ioredis'
import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Request, Response } from 'express'
import { UserInterface } from '~/auth/ldap.interface'
import { AbstractController } from '~/common/abstract.controller'
import { Authorization } from '~/common/authorization.decorator'
import { Public } from '~/common/public.decorator'
import { AuthService } from './auth.service'

@Public()
@Controller('auth')
export class AuthController extends AbstractController {
  public constructor(
    protected moduleRef: ModuleRef,
    protected service: AuthService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    super(moduleRef)
  }

  @Post('ldap')
  @UseGuards(AuthGuard('ldap'))
  public async authenticateWithLdap(
    @Req() req: Request & { user: UserInterface },
    @Res() res: Response,
  ): Promise<Response> {
    console.log(req.user)
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      ...(await this.service.tokensDelivery(req.user)),
    })
  }

  @Post('refresh')
  public async refresh(@Body() body, @Res() res: Response): Promise<Response> {
    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      ...(await this.service.refresh(body?.refreshToken)),
    })
  }

  @Get('check')
  @UseGuards(AuthGuard('jwt'))
  public async check(@Req() req: Request & { user: UserInterface }, @Res() res: Response): Promise<Response> {
    const user = req.user
    delete user.cryptpasswd
    return res.status(HttpStatus.OK).json({ user })
  }

  @Post('logout')
  public async logout(@Authorization() auth, @Res() res: Response): Promise<Response> {
    await this.service.clearSession(auth.sub, auth.refreshKey)
    return res.status(HttpStatus.OK).json({ statusCode: HttpStatus.OK })
  }
}
