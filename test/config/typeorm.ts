import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeormTestingModuleConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:',
  entities: ['src/**/*.entity.ts'],
  synchronize: true,
};
