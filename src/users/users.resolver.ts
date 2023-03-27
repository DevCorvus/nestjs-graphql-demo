import { ConflictException } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { Todo } from '../todos/todo.entity';
import { TodosService } from '../todos/todos.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './user.entity';
import { UsersService } from './users.service';

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
    const foundUser = await this.usersService.findOne(id);

    if (foundUser) {
      return foundUser;
    } else {
      throw new UserNotFoundException();
    }
  }

  @Mutation(() => User)
  async createUser(@Args('data') data: CreateUserInput): Promise<User | null> {
    try {
      const newUser = await this.usersService.create(data);
      return newUser;
    } catch (error) {
      throw new ConflictException('User already exists');
    }
  }

  @Mutation(() => User)
  async updateUser(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateUserInput,
  ): Promise<User | null> {
    const updatedUser = await this.usersService.update(id, data);

    if (updatedUser) {
      return updatedUser;
    } else {
      throw new UserNotFoundException();
    }
  }

  @Mutation(() => User)
  async deleteUser(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<User | null> {
    const deletedUser = await this.usersService.delete(id);

    if (deletedUser) {
      return deletedUser;
    } else {
      throw new UserNotFoundException();
    }
  }

  @ResolveField()
  async todos(@Parent() user: User): Promise<Todo[]> {
    return this.todosService.findAll({ user: user.id });
  }
}
