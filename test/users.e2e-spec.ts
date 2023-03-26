import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { User } from '../src/users/user.entity';
import { UsersService } from '../src/users/users.service';
import { mockUser, mockUserUpdate } from './mock-data/users';

describe('UsersResolver (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let httpRequest: request.SuperTest<request.Test>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    usersService = moduleFixture.get<UsersService>(UsersService);

    app = moduleFixture.createNestApplication();
    await app.init();

    httpRequest = request(app.getHttpServer());
  });

  afterEach(async () => {
    await app.close();
  });

  it('should create a user', async () => {
    const data = {
      query: `
        mutation CreateUser($data: CreateUserInput!) {
          createUser(data: $data) {
            id
            email
            password
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        data: mockUser,
      },
    };

    const res = await httpRequest.post('/graphql').send(data);
    expect(res.status).toBe(200);

    const resData = res.body.data.createUser;
    expect(resData).toMatchObject({
      id: expect.any(Number),
      email: mockUser.email,
      password: mockUser.password,
    });
    expect(new Date(resData.createdAt).getTime).not.toBeNaN();
    expect(new Date(resData.updatedAt).getTime).not.toBeNaN();

    const userExists = await usersService.exists(res.body.data.createUser.id);
    expect(userExists).toBeTruthy();
  });

  describe('after user created', () => {
    let user: User;

    beforeEach(async () => {
      user = await usersService.create(mockUser);
    });

    it('should return all users', async () => {
      const data = {
        query: `
          query {
            users {
              id
            }
          }
        `,
      };

      const res = await httpRequest.post('/graphql').send(data);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.users)).toBeTruthy();
      expect(res.body.data.users).toHaveLength(1);
      expect(res.body.data.users).toContainEqual({
        id: user.id,
      });
    });

    it('should return one user', async () => {
      const data = {
        query: `
          query {
            user(id: ${user.id}) {
              id
              email
            }
          }
        `,
      };

      const res = await httpRequest.post('/graphql').send(data);

      expect(res.status).toBe(200);
      expect(res.body.data.user).toEqual({
        id: user.id,
        email: user.email,
      });
    });

    it('should update a user', async () => {
      const data = {
        query: `
          mutation UpdateUser($id: Int!, $data: UpdateUserInput!) {
            updateUser(id: $id, data: $data) {
              id
              email
            }
          }
        `,
        variables: {
          id: user.id,
          data: mockUserUpdate,
        },
      };

      const res = await httpRequest.post('/graphql').send(data);

      expect(res.status).toBe(200);
      expect(res.body.data.updateUser).toEqual({
        id: user.id,
        email: mockUserUpdate.email,
      });
    });

    it('should delete a user', async () => {
      const data = {
        query: `
          mutation DeleteUser($id: Int!) {
            deleteUser(id: $id) {
              id
              email
            }
          }
        `,
        variables: {
          id: user.id,
        },
      };

      const res = await httpRequest.post('/graphql').send(data);

      expect(res.status).toBe(200);
      expect(res.body.data.deleteUser).toEqual({
        id: user.id,
        email: user.email,
      });

      const userExists = await usersService.exists(user.id);
      expect(userExists).toBeFalsy();
    });
  });
});
