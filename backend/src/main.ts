import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });
  
  // Enable CORS
  app.enableCors();
  
  // Add global prefix
  app.setGlobalPrefix('api');
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`API endpoints are available at: http://localhost:${port}/api`);
  logger.log('Available endpoints:');
  logger.log('- GET    /api/users');
  logger.log('- POST   /api/users');
  logger.log('- GET    /api/users/:id');
  logger.log('- PATCH  /api/users/:id');
  logger.log('- DELETE /api/users/:id');
}
bootstrap();
