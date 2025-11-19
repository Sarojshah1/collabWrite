import mongoose from 'mongoose';

const UserPreferenceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, index: true },
    // Aggregated preference scores
    tagScores: { type: Map, of: Number, default: {} },
    authorScores: { type: Map, of: Number, default: {} },
    categoryScores: { type: Map, of: Number, default: {} },
    // Recency/decay and last updated timestamp
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const UserPreference = mongoose.model('UserPreference', UserPreferenceSchema);
export default UserPreference;
