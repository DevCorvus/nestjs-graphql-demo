import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { typeormTestingModuleConfig } from '../../test/config/typeorm';
import { mockTodo, mockTodoUpdate } from '../../test/mock-data/todos';
import { mockUser } from '../../test/mock-data/users';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { Todo } from './todo.entity';
import { TodosService } from './todos.service';

describe('TodosService', () => {
  let usersService: UsersService;
  let todosService: TodosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(typeormTestingModuleConfig),
        TypeOrmModule.forFeature([User, Todo]),
      ],
      providers: [UsersService, TodosService],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    todosService = module.get<TodosService>(TodosService);
  });

  describe('after user created', () => {
    let user: User;

    beforeEach(async () => {
      user = await usersService.create(mockUser);
    });

    it('should create todo', () => {
      return expect(todosService.create(user.id, mockTodo)).resolves.toEqual({
        id: expect.any(Number),
        title: mockTodo.title,
        done: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        user: user.id,
      });
    });

    describe('after todo created', () => {
      let todo: Todo;

      beforeEach(async () => {
        todo = await todosService.create(user.id, mockTodo);
      });

      it('should check if todo exists', () => {
        return expect(todosService.exists(todo.id)).resolves.toBeTruthy();
      });

      it('should return a todo', () => {
        return expect(todosService.findOne(todo.id)).resolves.toEqual({
          id: expect.any(Number),
          title: todo.title,
          done: todo.done,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });

      it('should return all todos', () => {
        return expect(todosService.findAll()).resolves.toContainEqual({
          id: expect.any(Number),
          title: expect.any(String),
          done: expect.any(Boolean),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });

      it('should return all todos by done', () => {
        return expect(
          todosService.findAll({ done: false }),
        ).resolves.toContainEqual({
          id: expect.any(Number),
          title: expect.any(String),
          done: false,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });

      it('should update todo', () => {
        return expect(
          todosService.update(user.id, todo.id, mockTodoUpdate),
        ).resolves.toEqual({
          id: expect.any(Number),
          title: mockTodoUpdate.title,
          done: mockTodoUpdate.done,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });

      it('should delete todo', () => {
        return expect(todosService.delete(user.id, todo.id)).resolves.toEqual({
          id: expect.any(Number),
          title: todo.title,
          done: todo.done,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        });
      });
    });
  });
});
