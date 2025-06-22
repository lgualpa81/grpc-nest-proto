import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { Auth } from './auth.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from './service/jwt.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { AuthService } from './service/auth.service';

@Module({
  imports: [
    JwtModule.register({
      secret: 'dev' || process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forFeature([Auth])
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService, JwtStrategy]
})
export class AuthModule { }
