import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { ApolloContext } from '../apollo-context.interface';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { CreateTodoInput } from './dto/create-todo.input';
import { UpdateTodoInput } from './dto/update-todo.input';
import { Todo } from './todo.entity';
import { TodosService } from './todos.service';

@Resolver(() => Todo)
export class TodosResolver {
  constructor(
    private todosService: TodosService,
    private usersService: UsersService,
  ) {}

  @Query(() => [Todo])
  async todos(): Promise<Todo[]> {
    return this.todosService.findAll();
  }

  @Query(() => Todo)
  async todo(@Args('id', { type: () => Int }) id: number): Promise<Todo> {
    return this.todosService.findOne(id);
  }

  @Mutation(() => Todo)
  async createTodo(
    @Context() ctx: ApolloContext,
    @Args('data') data: CreateTodoInput,
  ): Promise<Todo | null> {
    const newTodo = await this.todosService.create(ctx.userId, data);
    return newTodo;
  }

  @Mutation(() => Todo)
  async updateTodo(
    @Context() ctx: ApolloContext,
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateTodoInput,
  ): Promise<Todo | null> {
    return this.todosService.update(ctx.userId, id, data);
  }

  @Mutation(() => Todo)
  async deleteTodo(
    @Context() ctx: ApolloContext,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Todo | null> {
    return this.todosService.delete(ctx.userId, id);
  }

  @ResolveField()
  async user(@Parent() todo: Todo): Promise<User> {
    return this.usersService.findOne(todo.user as number);
  }
}
