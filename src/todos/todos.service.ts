import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from './todo.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateTodoInput } from './dto/create-todo.input';
import { UpdateTodoInput } from './dto/update-todo.input';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo) private todosRepository: Repository<Todo>,
  ) {}

  async findAll(where?: FindOptionsWhere<Todo>): Promise<Todo[]> {
    return this.todosRepository.find({ where });
  }

  async findOne(todoId: number): Promise<Todo | null> {
    return this.todosRepository.findOneBy({ id: todoId });
  }

  async create(userId: number, data: CreateTodoInput): Promise<Todo | null> {
    const newTodo = this.todosRepository.create({ user: userId, ...data });
    return this.todosRepository.save(newTodo);
  }

  async update(
    userId: number,
    todoId: number,
    data: UpdateTodoInput,
  ): Promise<Todo | null> {
    const result = await this.todosRepository.update(
      { user: userId, id: todoId },
      data,
    );
    if (Boolean(result.affected)) {
      return this.todosRepository.findOneBy({ id: todoId });
    } else {
      return null;
    }
  }

  async delete(userId: number, todoId: number): Promise<Todo | null> {
    const todo = await this.todosRepository.findOneBy({
      user: userId,
      id: todoId,
    });
    if (todo) {
      await this.todosRepository.delete(todo.id);
      return todo;
    } else {
      return null;
    }
  }

  async exists(todoId: number): Promise<boolean> {
    return this.todosRepository.exist({ where: { id: todoId } });
  }
}
