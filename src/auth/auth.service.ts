import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserRole } from '@prisma/client';
import { ResponseService } from 'src/utils/response/response.service';
import { RegisterDto } from './dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly responseService: ResponseService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      const { password_hash, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any) {
    const payload = { sub: user.id, role: user.role, email: user.email };
    const data = {
      access_token: this.jwtService.sign(payload),
      user,
    };
    return this.responseService.success('Logged in successfully', data);
  }

  async register(data: RegisterDto) {
    console.log({ data });
    const foundUser = await this.usersService.findByEmail(data.email);

    if (foundUser) {
      throw new ConflictException('user already exists');
    }
    const hashed = await bcrypt.hash(data.password, 10);

    const newUser = await this.usersService.create({
      email: data.email,
      password_hash: hashed,
      role: (data.role as UserRole) ?? UserRole.USER,
      first_name: data.first_name,
      last_name: data.last_name,
      education_level: data.education_level,
      experience_years: data.experience_years,
      interests: data.interests || [],
    });

    return this.responseService.success(
      'User account registered successfully',
      newUser,
    );
  }
}
