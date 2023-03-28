import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { typeormTestingModuleConfig } from '../../test/config/typeorm';
import { mockUser } from '../../test/mock-data/users';
import { PasswordService } from '../password/password.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { jwtModuleConfig } from './config/jwt.config';

describe('AuthService', () => {
  let usersService: UsersService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(typeormTestingModuleConfig),
        TypeOrmModule.forFeature([User]),
        JwtModule.register(jwtModuleConfig),
      ],
      providers: [AuthService, UsersService, PasswordService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('after user created', () => {
    let user: User;

    beforeEach(async () => {
      user = await usersService.create(mockUser);
    });

    it('should validate and login user', async () => {
      const validatedUser = await authService.validateUser(
        user.email,
        mockUser.password,
      );
      expect(validatedUser).toEqual({
        id: user.id,
        email: user.email,
      });

      const jwt = await authService.login(validatedUser);
      expect(jwt).toEqual({
        accessToken: expect.any(String),
      });
    });
  });
});
