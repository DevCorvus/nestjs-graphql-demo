import * as request from 'supertest';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { Todo } from '../src/todos/todo.entity';
import { TodosService } from '../src/todos/todos.service';
import { User } from '../src/users/user.entity';
import { UsersService } from '../src/users/users.service';
import { mockTodo } from './mock-data/todos';
import { mockUser, mockUserUpdate } from './mock-data/users';

describe('UsersResolver (e2e)', () => {
  let app: INestApplication;
  let httpRequest: request.SuperTest<request.Test>;
  let authService: AuthService;
  let usersService: UsersService;
  let todosService: TodosService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    httpRequest = request(app.getHttpServer());
    authService = moduleFixture.get<AuthService>(AuthService);
    usersService = moduleFixture.get<UsersService>(UsersService);
    todosService = moduleFixture.get<TodosService>(TodosService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should not found a user', async () => {
    const data = {
      query: `
        query {
          user(id: 1) {
            id
          }
        }
      `,
    };

    const res = await httpRequest.post('/graphql').send(data);

    expect(res.status).toBe(200);
    expect(res.body.errors).toContainEqual({
      error: 'Not Found',
      message: 'User not found',
      statusCode: 404,
    });
  });

  it('should create a user', async () => {
    const data = {
      query: `
        mutation CreateUser($data: CreateUserInput!) {
          createUser(data: $data) {
            id
            email
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
    });
    expect(new Date(resData.createdAt).getTime).not.toBeNaN();
    expect(new Date(resData.updatedAt).getTime).not.toBeNaN();

    const userExists = await usersService.exists(resData.id);
    expect(userExists).toBeTruthy();
  });

  describe('validation errors on create user', () => {
    it('invalid email', async () => {
      const data = {
        query: `
            mutation CreateUser($data: CreateUserInput!) {
              createUser(data: $data) {
                id
              }
            }
          `,
        variables: {
          data: {
            email: 'notanemail.com',
            password: mockUser.password,
          },
        },
      };

      const res = await httpRequest.post('/graphql').send(data);

      expect(res.status).toBe(200);
      expect(res.body.errors).toContainEqual({
        error: 'Bad Request',
        message: ['email must be an email'],
        statusCode: 400,
      });
    });

    it('email too long', async () => {
      const data = {
        query: `
            mutation CreateUser($data: CreateUserInput!) {
              createUser(data: $data) {
                id
              }
            }
          `,
        variables: {
          data: {
            email: 'a'.repeat(200).concat('@email.com'),
            password: mockUser.password,
          },
        },
      };

      const res = await httpRequest.post('/graphql').send(data);

      expect(res.status).toBe(200);
      expect(res.body.errors).toContainEqual({
        error: 'Bad Request',
        message: [
          'email must be shorter than or equal to 200 characters',
          'email must be an email',
        ],
        statusCode: 400,
      });
    });

    it('password too short', async () => {
      const data = {
        query: `
            mutation CreateUser($data: CreateUserInput!) {
              createUser(data: $data) {
                id
              }
            }
          `,
        variables: {
          data: {
            email: mockUser.email,
            password: 'aaa',
          },
        },
      };

      const res = await httpRequest.post('/graphql').send(data);

      expect(res.status).toBe(200);
      expect(res.body.errors).toContainEqual({
        error: 'Bad Request',
        message: ['password must be longer than or equal to 6 characters'],
        statusCode: 400,
      });
    });

    it('password too long', async () => {
      const data = {
        query: `
            mutation CreateUser($data: CreateUserInput!) {
              createUser(data: $data) {
                id
              }
            }
          `,
        variables: {
          data: {
            email: mockUser.email,
            password: 'a'.repeat(251),
          },
        },
      };

      const res = await httpRequest.post('/graphql').send(data);

      expect(res.status).toBe(200);
      expect(res.body.errors).toContainEqual({
        error: 'Bad Request',
        message: ['password must be shorter than or equal to 250 characters'],
        statusCode: 400,
      });
    });
  });

  describe('after user created', () => {
    let user: User;

    beforeEach(async () => {
      user = await usersService.create(mockUser);
    });

    it('should not create an already existing user', async () => {
      const data = {
        query: `
          mutation CreateUser($data: CreateUserInput!) {
            createUser(data: $data) {
              id
            }
          }
        `,
        variables: {
          data: mockUser,
        },
      };

      const res = await httpRequest.post('/graphql').send(data);
      expect(res.status).toBe(200);
      expect(res.body.errors).toContainEqual({
        error: 'Conflict',
        message: 'User already exists',
        statusCode: 409,
      });
    });

    it('should get all users', async () => {
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

      const resData = res.body.data.users;
      expect(Array.isArray(resData)).toBeTruthy();
      expect(resData).toHaveLength(1);
      expect(resData).toContainEqual({
        id: expect.any(Number),
      });
    });

    it('should get one user', async () => {
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

    it('should not allow to update user', async () => {
      const data = {
        query: `
          mutation UpdateUser($data: UpdateUserInput!) {
            updateUser(data: $data) {
              id
            }
          }
        `,
        variables: {
          data: mockUserUpdate,
        },
      };

      const res = await httpRequest
        .post('/graphql')
        .set('Authorization', 'Bearer uwu')
        .send(data);

      expect(res.status).toBe(200);
      expect(res.body.errors).toContainEqual({
        message: 'Unauthorized',
        statusCode: 401,
      });
    });

    it('should not allow to delete user', async () => {
      const data = {
        query: `
          mutation {
            deleteUser {
              id
            }
          }
        `,
      };

      const res = await httpRequest
        .post('/graphql')
        .set('Authorization', 'Bearer uwu')
        .send(data);

      expect(res.status).toBe(200);
      expect(res.body.errors).toContainEqual({
        message: 'Unauthorized',
        statusCode: 401,
      });
    });

    describe('after user logged in', () => {
      let accessToken: string;

      beforeEach(async () => {
        const jwt = await authService.login({
          id: user.id,
          email: user.email,
        });
        accessToken = jwt.accessToken;
      });

      describe('validation errors on update user', () => {
        it('invalid email', async () => {
          const data = {
            query: `
              mutation UpdateUser($data: UpdateUserInput!) {
                updateUser(data: $data) {
                  id
                }
              }
            `,
            variables: {
              data: {
                email: 'notanemail.com',
                password: mockUserUpdate.password,
              },
            },
          };

          const res = await httpRequest
            .post('/graphql')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(data);

          expect(res.status).toBe(200);
          expect(res.body.errors).toContainEqual({
            error: 'Bad Request',
            message: ['email must be an email'],
            statusCode: 400,
          });
        });

        it('email too long', async () => {
          const data = {
            query: `
              mutation UpdateUser($data: UpdateUserInput!) {
                updateUser(data: $data) {
                  id
                }
              }
            `,
            variables: {
              data: {
                email: 'a'.repeat(200).concat('@email.com'),
                password: mockUserUpdate.password,
              },
            },
          };

          const res = await httpRequest
            .post('/graphql')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(data);

          expect(res.status).toBe(200);
          expect(res.body.errors).toContainEqual({
            error: 'Bad Request',
            message: [
              'email must be shorter than or equal to 200 characters',
              'email must be an email',
            ],
            statusCode: 400,
          });
        });

        it('password too short', async () => {
          const data = {
            query: `
              mutation UpdateUser($data: UpdateUserInput!) {
                updateUser(data: $data) {
                  id
                }
              }
            `,
            variables: {
              data: {
                email: mockUserUpdate.email,
                password: 'aaa',
              },
            },
          };

          const res = await httpRequest
            .post('/graphql')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(data);

          expect(res.status).toBe(200);
          expect(res.body.errors).toContainEqual({
            error: 'Bad Request',
            message: ['password must be longer than or equal to 6 characters'],
            statusCode: 400,
          });
        });

        it('password too long', async () => {
          const data = {
            query: `
              mutation UpdateUser($data: UpdateUserInput!) {
                updateUser(data: $data) {
                  id
                }
              }
            `,
            variables: {
              data: {
                email: mockUserUpdate.email,
                password: 'a'.repeat(251),
              },
            },
          };

          const res = await httpRequest
            .post('/graphql')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(data);

          expect(res.status).toBe(200);
          expect(res.body.errors).toContainEqual({
            error: 'Bad Request',
            message: [
              'password must be shorter than or equal to 250 characters',
            ],
            statusCode: 400,
          });
        });
      });

      it('should update a user', async () => {
        const data = {
          query: `
            mutation UpdateUser($data: UpdateUserInput!) {
              updateUser(data: $data) {
                id
                email
              }
            }
          `,
          variables: {
            data: mockUserUpdate,
          },
        };

        const res = await httpRequest
          .post('/graphql')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(data);

        expect(res.status).toBe(200);
        expect(res.body.data.updateUser).toEqual({
          id: user.id,
          email: mockUserUpdate.email,
        });
      });

      it('should delete a user', async () => {
        const data = {
          query: `
            mutation {
              deleteUser {
                id
                email
              }
            }
          `,
        };

        const res = await httpRequest
          .post('/graphql')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(data);

        expect(res.status).toBe(200);
        expect(res.body.data.deleteUser).toEqual({
          id: user.id,
          email: user.email,
        });

        const userExists = await usersService.exists(user.id);
        expect(userExists).toBeFalsy();
      });
    });

    describe('after todo created', () => {
      let todo: Todo;

      beforeEach(async () => {
        todo = await todosService.create(user.id, mockTodo);
      });

      it('should get user with todos', async () => {
        const data = {
          query: `
            query {
              user(id: ${user.id}) {
                id
                email
                todos {
                  title
                }
              }
            }
          `,
        };

        const res = await httpRequest.post('/graphql').send(data);

        expect(res.status).toBe(200);
        expect(res.body.data.user).toEqual({
          id: user.id,
          email: user.email,
          todos: [
            {
              title: todo.title,
            },
          ],
        });
      });
    });
  });
});
