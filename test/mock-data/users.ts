import { UpdateUserInput } from '../../src/users/dto/update-user.input';
import { CreateUserInput } from '../../src/users/dto/create-user.input';

export const mockUser: CreateUserInput = {
  email: 'fulano@email.com',
  password: '123456',
};

export const mockUserUpdate: UpdateUserInput = {
  email: 'fulanito@email.com',
};
