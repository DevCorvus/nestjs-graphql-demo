import { UseGuards } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { AuthUser } from '../auth/auth.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GqlAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
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
  @UseGuards(GqlAuthGuard)
  async createTodo(
    @CurrentUser() user: AuthUser,
    @Args('data') data: CreateTodoInput,
  ): Promise<Todo | null> {
    const newTodo = await this.todosService.create(user.id, data);
    return newTodo;
  }

  @Mutation(() => Todo)
  @UseGuards(GqlAuthGuard)
  async updateTodo(
    @CurrentUser() user: AuthUser,
    @Args('id', { type: () => Int })
    id: number,
    @Args('data') data: UpdateTodoInput,
  ): Promise<Todo | null> {
    return this.todosService.update(user.id, id, data);
  }

  @Mutation(() => Todo)
  @UseGuards(GqlAuthGuard)
  async deleteTodo(
    @CurrentUser() user: AuthUser,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Todo | null> {
    return this.todosService.delete(user.id, id);
  }

  @ResolveField()
  async user(@Parent() todo: Todo): Promise<User> {
    return this.usersService.findOne({ id: todo.user as number });
  }
}
