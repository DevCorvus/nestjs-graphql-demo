import { FindOptionsWhere, Repository, UpdateResult } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PasswordService } from '../password/password.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private passwordService: PasswordService,
  ) {}

  async findAll(where?: FindOptionsWhere<User>): Promise<User[]> {
    return this.usersRepository.find({ where });
  }

  async findOne(where: FindOptionsWhere<User>): Promise<User | null> {
    return this.usersRepository.findOneBy(where);
  }

  async create(data: CreateUserInput): Promise<User> {
    const newUser = this.usersRepository.create(data);
    newUser.password = await this.passwordService.hash(data.password);
    return this.usersRepository.save(newUser);
  }

  async update(userId: number, data: UpdateUserInput): Promise<User | null> {
    let result: UpdateResult;

    if (data.password) {
      const hashedPassword = await this.passwordService.hash(data.password);
      result = await this.usersRepository.update(userId, {
        ...data,
        password: hashedPassword,
      });
    } else {
      result = await this.usersRepository.update(userId, data);
    }

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

  async exists(userId: number): Promise<boolean> {
    return this.usersRepository.exist({ where: { id: userId } });
  }
}
