import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env.production', '.env'],
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 20, // 20 requests per minute
      },
    ]),
    
    // Feature modules
    AuthModule,
    AiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
