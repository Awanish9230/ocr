import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
  uploaderId: mongoose.Types.ObjectId;
  title: string;
  originalFilename: string;
  url: string;
  publicId: string; // Cloudinary public_id
  documentType: string;
  status: 'Pending' | 'Processing' | 'Validation_Pending' | 'Completed' | 'Failed';
  confidenceScore?: number;
  extractedData?: Record<string, any>;
  validationErrors?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema(
  {
    uploaderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    originalFilename: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    documentType: {
      type: String,
      default: 'Unknown',
      // We will allow open strings initially but recommend: Invoice, BankStatement, ITR, SalarySlip, etc.
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Validation_Pending', 'Completed', 'Failed'],
      default: 'Pending',
      index: true,
    },
    confidenceScore: { type: Number },
    extractedData: { type: Schema.Types.Mixed },
    validationErrors: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

export const Document = mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
