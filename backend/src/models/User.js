import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
    suspended: { type: Boolean, default: false, index: true },
    interests: {
      tags: { type: [String], default: [] },
      categories: { type: [String], default: [] },
      authors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    },
    notificationSettings: {
      marketing: { type: Boolean, default: false },
      newFollower: { type: Boolean, default: true },
      blogUpdates: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', UserSchema);
export default User;
