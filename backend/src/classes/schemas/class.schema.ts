import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Class extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  teacherId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  filiere: string;

  @Prop({ required: true })
  niveau: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  students: MongooseSchema.Types.ObjectId[];
}

export const ClassSchema = SchemaFactory.createForClass(Class);

// Indexes
ClassSchema.index({ teacherId: 1 });
ClassSchema.index({ filiere: 1, niveau: 1 }); 