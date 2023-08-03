import { NestFactory } from '@nestjs/core'
import { MessagePattern, MicroserviceOptions, Transport } from '@nestjs/microservices'
import { Controller, Module } from '@nestjs/common'

@Controller()
export class MathController {
  @MessagePattern({ cmd: 'sum' })
  accumulate(data: number[]): number {
    return (data || []).reduce((a, b) => a + b)
  }
}

@Module({
  controllers: [MathController],
})
export class AppModule {}

;(async (): Promise<void> => {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.REDIS,
    options: {
      host: 'redis-16759.c250.eu-central-1-1.ec2.cloud.redislabs.com',
      port: 16759,
      password: 'eFq2jSo2wVnzgYB5ZF6WQCZg6f1U5sZu',
    },
  })
  await app.listen()
})()
