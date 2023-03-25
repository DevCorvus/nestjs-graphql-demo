import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../users/users.module';
import { Todo } from './todo.entity';
import { TodosResolver } from './todos.resolver';
import { TodosService } from './todos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Todo]), forwardRef(() => UsersModule)],
  providers: [TodosService, TodosResolver],
  exports: [TodosService],
})
export class TodosModule {}
