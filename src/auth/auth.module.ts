import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { PasswordService } from '../password/password.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtModuleConfig } from './config/jwt.config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [UsersModule, JwtModule.register(jwtModuleConfig)],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
