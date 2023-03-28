import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { User } from '../src/users/user.entity';
import { UsersService } from '../src/users/users.service';
import { mockUser } from './mock-data/users';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let httpRequest: request.SuperTest<request.Test>;
  let usersService: UsersService;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    httpRequest = request(app.getHttpServer());
    usersService = moduleFixture.get<UsersService>(UsersService);
    authService = moduleFixture.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('/auth/status (GET) -> 401', async () => {
    const res = await httpRequest
      .get('/auth/status')
      .set('Authorization', 'Bearer uwu');

    expect(res.status).toBe(401);
  });

  describe('after user created', () => {
    let user: User;

    beforeEach(async () => {
      user = await usersService.create(mockUser);
    });

    it('/auth/login (POST)', async () => {
      const res = await httpRequest
        .post('/auth/login')
        .send({ email: user.email, password: mockUser.password });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        accessToken: expect.any(String),
      });
    });

    describe('after user logged in', () => {
      let accessToken: string;

      beforeEach(async () => {
        const jwt = await authService.login({ id: user.id, email: user.email });
        accessToken = jwt.accessToken;
      });

      it('/auth/status (GET)', async () => {
        const res = await httpRequest
          .get('/auth/status')
          .set('Authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
      });
    });
  });
});
