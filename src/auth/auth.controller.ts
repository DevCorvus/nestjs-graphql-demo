import { Request } from 'express';

import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';

import { AuthService, AuthUser } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: Request) {
    return this.authService.login(req.user as AuthUser);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  status() {
    return;
  }
}
