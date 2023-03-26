import { UpdateTodoInput } from '../../src/todos/dto/update-todo.input';
import { CreateTodoInput } from '../../src/todos/dto/create-todo.input';

export const mockTodo: CreateTodoInput = {
  title: 'Visit ohio',
};

export const mockTodoUpdate: UpdateTodoInput = {
  title: 'Leave ohio',
  done: true,
};
