import { Controller, Get, HttpStatus, Req, Res, UseGuards } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Request, Response } from 'express'
import { AbstractController } from '~/_common/abstracts/abstract.controller'
import { Public } from '~/_common/decorators/public.decorator'
import { AuthService } from './auth.service'
import { ApiTags } from '@nestjs/swagger'
import { ApiReadResponseDecorator } from '~/_common/decorators/api-read-response.decorator'

@Public()
@ApiTags('auth')
@Controller('auth')
export class AuthController extends AbstractController {
  public constructor(
    protected moduleRef: ModuleRef,
    protected service: AuthService,
  ) {
    super(moduleRef)
  }

  @Get('info')
  @UseGuards(AuthGuard('jwt'))
  @ApiReadResponseDecorator(null, {
    schema: {
      properties: {
        statusCode: {
          type: 'number',
          enum: [HttpStatus.OK],
        },
        user: {
          type: 'object',
        },
      },
    },
  })
  public async info(@Req() req: Request & { user: Express.User }, @Res() res: Response): Promise<Response> {
    const user = req.user
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      user,
    })
  }
}
