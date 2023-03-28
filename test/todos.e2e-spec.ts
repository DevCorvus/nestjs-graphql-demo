import * as request from 'supertest';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { Todo } from '../src/todos/todo.entity';
import { TodosService } from '../src/todos/todos.service';
import { User } from '../src/users/user.entity';
import { UsersService } from '../src/users/users.service';
import { mockTodo, mockTodoUpdate } from './mock-data/todos';
import { mockUser } from './mock-data/users';

describe('TodosResolver (e2e)', () => {
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

  describe('after user created and logged in', () => {
    let user: User;

    beforeEach(async () => {
      user = await usersService.create(mockUser);
    });

    describe('after todo created', () => {
      let todo: Todo;

      beforeEach(async () => {
        todo = await todosService.create(user.id, mockTodo);
      });

      it('should get all todos', async () => {
        const data = {
          query: `
            query {
              todos {
                id
              }
            }
          `,
        };

        const res = await httpRequest.post('/graphql').send(data);
        expect(res.status).toBe(200);

        const resData = res.body.data.todos;
        expect(Array.isArray(resData)).toBeTruthy();
        expect(resData).toHaveLength(1);
        expect(resData).toContainEqual({
          id: expect.any(Number),
        });
      });

      it('should get one todo', async () => {
        const data = {
          query: `
            query {
              todo(id: ${todo.id}) {
                id
                title
              }
            }
          `,
        };

        const res = await httpRequest.post('/graphql').send(data);

        expect(res.status).toBe(200);
        expect(res.body.data.todo).toEqual({
          id: todo.id,
          title: todo.title,
        });
      });

      it('should get one todo with user', async () => {
        const data = {
          query: `
            query {
              todo(id: ${todo.id}) {
                id
                title
                user {
                  email
                }
              }
            }
          `,
        };

        const res = await httpRequest.post('/graphql').send(data);

        expect(res.status).toBe(200);
        expect(res.body.data.todo).toEqual({
          id: todo.id,
          title: todo.title,
          user: {
            email: user.email,
          },
        });
      });

      it('should not allow to update todo', async () => {
        const data = {
          query: `
            mutation UpdateTodo($id: Int!, $data: UpdateTodoInput!) {
              updateTodo(id: $id, data: $data) {
                id
              }
            }
          `,
          variables: {
            id: todo.id,
            data: mockTodoUpdate,
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

      it('should not allow to delete todo', async () => {
        const data = {
          query: `
            mutation DeleteTodo($id: Int!) {
              deleteTodo(id: $id) {
                id
              }
            }
          `,
          variables: {
            id: todo.id,
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

      describe('after user logged in', () => {
        let accessToken: string;

        beforeEach(async () => {
          const jwt = await authService.login({
            id: user.id,
            email: user.email,
          });
          accessToken = jwt.accessToken;
        });

        it('should create a todo', async () => {
          const data = {
            query: `
              mutation CreateTodo($data: CreateTodoInput!) {
                createTodo(data: $data) {
                  id
                  title
                  done
                  createdAt
                  updatedAt
                }
              }
            `,
            variables: {
              data: mockTodo,
            },
          };

          const res = await httpRequest
            .post('/graphql')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(data);
          expect(res.status).toBe(200);

          const resData = res.body.data.createTodo;
          expect(resData).toMatchObject({
            id: expect.any(Number),
            title: mockTodo.title,
            done: false,
          });
          expect(new Date(resData.createdAt).getTime).not.toBeNaN();
          expect(new Date(resData.updatedAt).getTime).not.toBeNaN();

          const todoExists = await todosService.exists(resData.id);
          expect(todoExists).toBeTruthy();
        });

        it('should update a todo', async () => {
          const data = {
            query: `
              mutation UpdateTodo($id: Int!, $data: UpdateTodoInput!) {
                updateTodo(id: $id, data: $data) {
                  id
                  title
                }
              }
            `,
            variables: {
              id: todo.id,
              data: mockTodoUpdate,
            },
          };

          const res = await httpRequest
            .post('/graphql')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(data);

          expect(res.status).toBe(200);
          expect(res.body.data.updateTodo).toEqual({
            id: todo.id,
            title: mockTodoUpdate.title,
          });
        });

        it('should delete a todo', async () => {
          const data = {
            query: `
              mutation DeleteTodo($id: Int!) {
                deleteTodo(id: $id) {
                  id
                  title
                }
              }
            `,
            variables: {
              id: todo.id,
            },
          };

          const res = await httpRequest
            .post('/graphql')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(data);

          expect(res.status).toBe(200);
          expect(res.body.data.deleteTodo).toEqual({
            id: todo.id,
            title: todo.title,
          });

          const todoExists = await todosService.exists(todo.id);
          expect(todoExists).toBeFalsy();
        });
      });
    });
  });
});
