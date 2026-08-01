import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IAuditLog extends MongooseDocument {
  userId?: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: mongoose.Types.ObjectId;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true, index: true }, // e.g., 'Upload', 'Review', 'Login'
    resource: { type: String, required: true }, // e.g., 'Document', 'User'
    resourceId: { type: Schema.Types.ObjectId },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Audit logs are immutable
  }
);

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
