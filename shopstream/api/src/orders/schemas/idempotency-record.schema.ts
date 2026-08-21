import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum IdempotencyStatus {
  Started = 'started',
  Completed = 'completed',
}

@Schema({ timestamps: true, collection: 'idempotency_records' })
export class IdempotencyRecord {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 255 })
  key!: string;

  @Prop({ required: true, enum: Object.values(IdempotencyStatus) })
  status!: IdempotencyStatus;

  @Prop({ type: Types.ObjectId, ref: 'Order', default: null })
  orderId?: Types.ObjectId | null;
}

export const IdempotencyRecordSchema =
  SchemaFactory.createForClass(IdempotencyRecord);

export type IdempotencyRecordDocument = HydratedDocument<IdempotencyRecord>;

// Unique compound — claim key atomic qua insert
IdempotencyRecordSchema.index({ userId: 1, key: 1 }, { unique: true });
