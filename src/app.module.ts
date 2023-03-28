import { join } from 'path';

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { TodosModule } from './todos/todos.module';
import { UsersModule } from './users/users.module';
import { gqlErrorFormatter } from './utils/gqlErrorFormatter';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [
        process.env.NODE_ENV === 'test'
          ? 'src/**/*.entity.ts'
          : 'dist/**/*.entity.js',
      ],
      logging: process.env.NODE_ENV !== 'test',
      synchronize: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      formatError: gqlErrorFormatter,
    }),
    AuthModule,
    UsersModule,
    TodosModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
