import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { SubjectsModule } from './subjects/subjects.module';
import { LessonsModule } from './lessons/lessons.module';
import { ProgressModule } from './progress/progress.module';

const logger = new Logger('MongoDB');

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/skoolution', {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      autoIndex: true,
      autoCreate: true,
      retryWrites: true,
      w: 'majority',
      connectionFactory: (connection) => {
        connection.on('connected', () => {
          logger.log('MongoDB connected successfully');
        });
        connection.on('error', (error) => {
          logger.error('MongoDB connection error:', error);
        });
        connection.on('disconnected', () => {
          logger.warn('MongoDB disconnected');
        });
        return connection;
      },
    }),
    UsersModule,
    SubjectsModule,
    LessonsModule,
    ProgressModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
