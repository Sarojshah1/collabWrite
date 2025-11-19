import mongoose from 'mongoose';

const AssignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dueDate: { type: Date },
  },
  { timestamps: true }
);

const Assignment = mongoose.model('Assignment', AssignmentSchema);
export default Assignment;
