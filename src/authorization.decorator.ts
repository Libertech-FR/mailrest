import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const Authorization = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const [type, token] = request.header('authorization').split(' ')
  if (type == 'Bearer' && token) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, data] = token.split('.')
    const buffer = Buffer.from(data, 'base64').toString('ascii')
    try {
      return JSON.parse(buffer)
    } catch (e) {
      return null
    }
  }
  return null
})
