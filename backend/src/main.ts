import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

// Polyfill for crypto if not available
if (!globalThis.crypto) {
  globalThis.crypto = require('crypto').webcrypto || require('crypto');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  
  // Enable CORS for production
  app.enableCors({
    origin: [
      configService.get('FRONTEND_URL', 'http://localhost:3000'),
      'http://localhost:3000',
      'https://*.vercel.app',
      'https://localhost:3000',
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Set global prefix
  app.setGlobalPrefix('api');

  const port = configService.get('PORT', 3001);
  
  // For Vercel, we don't need to listen on a port
  if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Backend server running on http://localhost:${port}`);
  }
  
  return app;
}

// Export for Vercel serverless
export default bootstrap;

// Start normally for local development
if (require.main === module) {
  bootstrap();
}
