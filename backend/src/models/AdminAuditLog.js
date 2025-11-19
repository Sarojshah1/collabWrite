import mongoose from 'mongoose';

const AdminAuditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true, index: true },
    targetType: { type: String, enum: ['user', 'blog', 'system'], required: true, index: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, index: true },
    details: { type: Object, default: {} },
  },
  { timestamps: true }
);

const AdminAuditLog = mongoose.model('AdminAuditLog', AdminAuditLogSchema);
export default AdminAuditLog;
