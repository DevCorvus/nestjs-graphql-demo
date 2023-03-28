import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PasswordService } from '../password/password.service';
import { TodosModule } from '../todos/todos.module';
import { User } from './user.entity';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => TodosModule)],
  providers: [UsersService, UsersResolver, PasswordService],
  exports: [UsersService],
})
export class UsersModule {}
