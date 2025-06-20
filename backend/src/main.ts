import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });
  
  // Increase the body size limit
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '5mb' }));
  
  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:5000', // Your Next.js frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Add global prefix
  app.setGlobalPrefix('api');
  
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads/' });
  
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
