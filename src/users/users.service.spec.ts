import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

import { typeormTestingModuleConfig } from '../../test/config/typeorm';
import { mockUser, mockUserUpdate } from '../../test/mock-data/users';
import { PasswordService } from '../password/password.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(typeormTestingModuleConfig),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UsersService, PasswordService],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  it('should create user', () => {
    return expect(usersService.create(mockUser)).resolves.toEqual({
      id: expect.any(Number),
      email: mockUser.email,
      password: expect.any(String),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  describe('after user created', () => {
    let user: User;

    beforeEach(async () => {
      user = await usersService.create(mockUser);
    });

    it('should check if user exists', () => {
      return expect(usersService.exists(user.id)).resolves.toBeTruthy();
    });

    it('should return a user', () => {
      return expect(usersService.findOne({ id: user.id })).resolves.toEqual({
        id: expect.any(Number),
        email: user.email,
        password: user.password,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should return all users', () => {
      return expect(usersService.findAll()).resolves.toContainEqual({
        id: expect.any(Number),
        email: expect.any(String),
        password: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should return all users by password', () => {
      return expect(
        usersService.findAll({ password: user.password }),
      ).resolves.toContainEqual({
        id: expect.any(Number),
        email: expect.any(String),
        password: user.password,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should update user', () => {
      return expect(
        usersService.update(user.id, mockUserUpdate),
      ).resolves.toEqual({
        id: expect.any(Number),
        email: mockUserUpdate.email,
        password: expect.not.stringMatching(user.password),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should delete user', () => {
      return expect(usersService.delete(user.id)).resolves.toEqual({
        id: expect.any(Number),
        email: user.email,
        password: user.password,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });
  });
});
