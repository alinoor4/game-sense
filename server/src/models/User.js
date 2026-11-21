import mongoose from 'mongoose';
import { WEAKNESSES } from '../constants.js';
import { schemaOptions } from './options.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: 2, maxlength: 50 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email is not valid'],
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    profile: {
      game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', default: null },
      currentRank: { type: String, trim: true, maxlength: 40, default: '' },
      targetRank: { type: String, trim: true, maxlength: 40, default: '' },
      weakness: { type: String, enum: ['', ...WEAKNESSES], default: '' },
      dailyMinutes: {
        type: Number,
        min: [30, 'Minimum is 30 minutes'],
        max: [480, 'Maximum is 480 minutes'],
        default: 145,
        validate: { validator: Number.isInteger, message: 'Minutes must be a whole number' },
      },
    },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  },
  schemaOptions,
);

export const User = mongoose.model('User', userSchema);
