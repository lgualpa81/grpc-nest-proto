import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestMicroservice, ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { protobufPackage } from './product/product.pb';

async function bootstrap() {
  const app: INestMicroservice = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.GRPC,
    options: {
      url: '0.0.0.0:50053',
      package: protobufPackage,
      protoPath: join('node_modules/grpc-proto/proto/product.proto',)
    },
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  await app.listen();
}
bootstrap();
