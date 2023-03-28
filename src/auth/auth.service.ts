import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PasswordService } from '../password/password.service';
import { UsersService } from '../users/users.service';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthUser {
  id: number;
  email: string;
}

export interface UserJwtPayload extends JwtPayload {
  email: string;
}

export interface AuthTokens {
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private passwordService: PasswordService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthUser | null> {
    const user = await this.usersService.findOne({ email });

    if (!user) return null;

    const passwordDoMatch = await this.passwordService.compare(
      password,
      user.password,
    );

    if (passwordDoMatch) {
      return {
        id: user.id,
        email: user.email,
      };
    } else {
      return null;
    }
  }

  async login(validatedUser: AuthUser): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: String(validatedUser.id),
      email: validatedUser.email,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
