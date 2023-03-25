import { FindOptionsWhere, Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async findAll(where?: FindOptionsWhere<User>): Promise<User[]> {
    return this.usersRepository.find({ where });
  }

  async findOne(userId: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id: userId });
  }

  async create(data: CreateUserInput): Promise<User> {
    const newUser = this.usersRepository.create(data);
    return this.usersRepository.save(newUser);
  }

  async update(userId: number, data: UpdateUserInput): Promise<User | null> {
    const result = await this.usersRepository.update(userId, data);
    if (Boolean(result.affected)) {
      return this.usersRepository.findOneBy({ id: userId });
    } else {
      return null;
    }
  }

  async delete(userId: number): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (user) {
      await this.usersRepository.delete(user.id);
      return user;
    } else {
      return null;
    }
  }
}
