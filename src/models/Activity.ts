import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IActivity extends MongooseDocument {
  userId: mongoose.Types.ObjectId;
  type: string; // e.g., 'document_uploaded', 'report_generated', 'account_created'
  message: string;
  createdAt: Date;
}

const ActivitySchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Activity = mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);
