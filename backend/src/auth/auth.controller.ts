import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      const result = await this.authService.register(
        registerDto.email,
        registerDto.password
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.authService.login(
        loginDto.email,
        loginDto.password
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
