import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Field, Int, ObjectType } from '@nestjs/graphql';

import { User } from '../users/user.entity';

@Entity('todos')
@ObjectType()
export class Todo {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column()
  @Field()
  title: string;

  @Column({ default: false })
  @Field()
  done: boolean;

  @CreateDateColumn()
  @Field()
  createdAt: string;

  @UpdateDateColumn()
  @Field()
  updatedAt: string;

  @ManyToOne(() => User, (user) => user.todos)
  @Field(() => User)
  user: number | User;
}
