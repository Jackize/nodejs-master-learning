import {
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
  };
  const jwtService = {
    sign: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
    );
  });

  it('register trùng email → ConflictException', async () => {
    usersService.findByEmail.mockResolvedValue({
      _id: 'u1',
      email: 'buyer@shop.test',
      passwordHash: 'hash',
    });

    await expect(
      service.register({
        email: 'buyer@shop.test',
        password: 'password1',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('login sai password → UnauthorizedException Invalid credentials', async () => {
    const passwordHash = await bcrypt.hash('password1', 10);
    usersService.findByEmail.mockResolvedValue({
      _id: 'u1',
      email: 'buyer@shop.test',
      passwordHash,
    });

    await expect(
      service.login({
        email: 'buyer@shop.test',
        password: 'wrong-password',
      }),
    ).rejects.toEqual(new UnauthorizedException('Invalid credentials'));
  });

  it('login email không tồn tại → UnauthorizedException Invalid credentials', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'missing@shop.test',
        password: 'password1',
      }),
    ).rejects.toEqual(new UnauthorizedException('Invalid credentials'));
  });

  it('login thành công → accessToken từ JwtService', async () => {
    const passwordHash = await bcrypt.hash('password1', 10);
    usersService.findByEmail.mockResolvedValue({
      _id: 'u1',
      email: 'buyer@shop.test',
      passwordHash,
    });
    jwtService.sign.mockReturnValue('signed.jwt.token');

    await expect(
      service.login({
        email: 'buyer@shop.test',
        password: 'password1',
      }),
    ).resolves.toEqual({
      accessToken: 'signed.jwt.token',
      email: 'buyer@shop.test',
    });
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'u1',
      email: 'buyer@shop.test',
    });
  });
});
