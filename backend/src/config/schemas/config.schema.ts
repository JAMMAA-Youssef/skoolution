import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Config extends Document {
  @Prop({ required: true, trim: true, unique: true })
  type: string;

  @Prop({ type: [String], required: true })
  values: string[];

  @Prop({ type: String })
  description: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Number, default: 0 })
  version: number;

  @Prop({ type: Date })
  lastUpdated: Date;

  @Prop({ type: String })
  updatedBy: string;
}

export const ConfigSchema = SchemaFactory.createForClass(Config);

// Indexes
ConfigSchema.index({ type: 1 }, { unique: true });
ConfigSchema.index({ isActive: 1 });

// Method to validate values
ConfigSchema.methods.validateValues = function() {
  return this.values.length > 0;
};

// Static method to get active configs
ConfigSchema.statics.getActiveConfigs = function() {
  return this.find({ isActive: true });
}; 