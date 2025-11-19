import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/response.js';
import cloudinary from '../config/cloudinary.js';
import streamifier from 'streamifier';

function signToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, env.JWT_SECRET, { expiresIn: '7d' });
}

export const register = async (req, res) => {
  try {
    const { name, email, password, bio, avatar } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return sendError(res, 409, 'Email already in use');

    const hash = await bcrypt.hash(password, 10);
    let avatarUrl = avatar;
    if (req.file && req.file.buffer) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'avatars', resource_type: 'image' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
      avatarUrl = result.secure_url;
    }

    const user = await User.create({ name, email, password: hash, bio, avatar: avatarUrl });
    const token = signToken(user);

    return sendSuccess(
      res,
      { token, user: { id: user._id, name: user.name, email: user.email, bio: user.bio, avatar: user.avatar } },
      201
    );
  } catch (err) {
    return sendError(res, 500, 'Registration failed', err.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return sendError(res, 401, 'Invalid credentials');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return sendError(res, 401, 'Invalid credentials');

    const token = signToken(user);
    return sendSuccess(res, { token, user: { id: user._id, name: user.name, email: user.email, bio: user.bio, avatar: user.avatar } });
  } catch (err) {
    return sendError(res, 500, 'Login failed', err.message);
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('_id name email bio avatar followers following');
    return sendSuccess(res, { user });
  } catch (err) {
    return sendError(res, 500, 'Failed to fetch profile', err.message);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const update = {};
    const allowed = ['name', 'bio', 'avatar', 'interests', 'notificationSettings'];
    for (const key of allowed) {
      if (typeof req.body[key] !== 'undefined') update[key] = req.body[key];
    }

    // Handle password change
    const { currentPassword, newPassword } = req.body;
    if (newPassword) {
      const user = await User.findById(userId).select('password');
      if (!user) return sendError(res, 404, 'User not found');
      const ok = await bcrypt.compare(currentPassword || '', user.password);
      if (!ok) return sendError(res, 401, 'Current password is incorrect');
      const hash = await bcrypt.hash(newPassword, 10);
      update.password = hash;
    }

    // Handle avatar file upload if provided
    if (req.file && req.file.buffer) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'avatars', resource_type: 'image' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
      update.avatar = result.secure_url;
    }

    const updated = await User.findByIdAndUpdate(userId, update, { new: true })
      .select('_id name email bio avatar followers following interests notificationSettings');

    if (!updated) return sendError(res, 404, 'User not found');
    return sendSuccess(res, { user: updated });
  } catch (err) {
    return sendError(res, 500, 'Failed to update profile', err.message);
  }
};

export const searchUsers = async (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim();
    if (!q) {
      return sendSuccess(res, { users: [] });
    }

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const users = await User.find({
      suspended: { $ne: true },
      $or: [{ name: regex }, { email: regex }],
    })
      .select('_id name email avatar')
      .limit(20);

    return sendSuccess(res, { users });
  } catch (err) {
    return sendError(res, 500, 'Failed to search users', err.message);
  }
};
