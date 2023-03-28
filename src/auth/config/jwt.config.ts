import { JwtModuleOptions } from '@nestjs/jwt';

import { jwtConstants } from '../constants';

export const jwtModuleConfig: JwtModuleOptions = {
  secret: jwtConstants.secret,
  signOptions: {
    expiresIn: '60s',
  },
};
