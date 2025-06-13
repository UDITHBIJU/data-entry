import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

 async register(userData: any): Promise<any> {
    const { username, password, role } = userData;

    const existingUser = await this.userService.findByUsernameOrNull(username);
  

    if (existingUser) {
      throw new UnauthorizedException('Username already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
   
    const newUser = await this.userService.create({
      username,
      password: hashedPassword,
      role,
    });
    const { password: _, ...result } = newUser; // Exclude password from the result
    return result;
  }
  

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findByUsername(username);

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user; // Exclude password from the result
      return result;
    }
    return null;
  }


  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
