import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Competency extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Subject', required: true })
  domaine: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  competence: string;

  @Prop({ required: true, trim: true })
  sousCompetence: string;

  @Prop({ type: String, required: true })
  level: string;

  @Prop({ type: [String], default: [], required: false })
  keywords?: string[];

  @Prop({ type: Boolean, default: true, required: false })
  isActive?: boolean;

  @Prop({ type: String, required: false })
  description?: string;
}

export const CompetencySchema = SchemaFactory.createForClass(Competency);

// Indexes
CompetencySchema.index({ domaine: 1, competence: 1, sousCompetence: 1 }, { unique: true });
CompetencySchema.index({ keywords: 1 });

// Virtual for full competency path
CompetencySchema.virtual('fullPath').get(function() {
  return `${this.domaine} > ${this.competence} > ${this.sousCompetence}`;
}); 