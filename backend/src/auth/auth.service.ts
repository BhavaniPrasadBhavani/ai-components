import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface User {
  id: string;
  email: string;
  password: string; // In production, this should be hashed
  createdAt: Date;
}

@Injectable()
export class AuthService {
  private users: Map<string, User> = new Map();

  constructor(private jwtService: JwtService) {}

  async register(email: string, password: string) {
    // Check if user already exists
    const existingUser = Array.from(this.users.values()).find(u => u.email === email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Create new user (in production, hash the password)
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      password, // TODO: Hash this in production
      createdAt: new Date(),
    };

    this.users.set(user.id, user);

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async login(email: string, password: string) {
    // Find user by email
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (!user || user.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async validateUser(userId: string) {
    const user = this.users.get(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
    };
  }
}
