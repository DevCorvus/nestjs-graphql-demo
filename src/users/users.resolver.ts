import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { Todo } from '../todos/todo.entity';
import { TodosService } from '../todos/todos.service';
import { CreateUserInput } from './dto/create-user.input';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UpdateUserInput } from './dto/update-user.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private usersService: UsersService,
    private todosService: TodosService,
  ) {}

  @Query(() => [User])
  async users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => User)
  async user(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<User | null> {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  async createUser(@Args('data') data: CreateUserInput): Promise<User | null> {
    const newUser = await this.usersService.create(data);
    return newUser;
  }

  @Mutation(() => User)
  async updateUser(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateUserInput,
  ): Promise<User | null> {
    return this.usersService.update(id, data);
  }

  @Mutation(() => User)
  async deleteUser(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<User | null> {
    return this.usersService.delete(id);
  }

  @ResolveField()
  async todos(@Parent() user: User): Promise<Todo[]> {
    return this.todosService.findAll({ user: user.id });
  }
}
