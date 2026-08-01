import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IReport extends MongooseDocument {
  documentId?: mongoose.Types.ObjectId;
  generatedBy: mongoose.Types.ObjectId;
  reportUrl: string;
  reportType: 'PDF' | 'CSV' | 'Excel';
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', index: true },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reportUrl: { type: String, required: true },
    reportType: {
      type: String,
      enum: ['PDF', 'CSV', 'Excel'],
      required: true,
    },
    summary: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Report = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
