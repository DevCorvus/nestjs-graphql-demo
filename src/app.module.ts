import { join } from 'path';

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { TodosModule } from './todos/todos.module';
import { UsersModule } from './users/users.module';

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
      context: ({ req }) => {
        // TODO: Real authentication
        const userId: string | null = req.headers.authorization;
        if (userId) {
          return { userId: parseInt(userId) };
        } else {
          return { userId: null };
        }
      },
    }),
    UsersModule,
    TodosModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
