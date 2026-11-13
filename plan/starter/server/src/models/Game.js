import mongoose from 'mongoose';
import { GENRES, SLUG_PATTERN } from '../constants.js';
import { schemaOptions } from './options.js';

// A game is one learning track. Its sections are embedded; array order is display order.
const gameSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: 2, maxlength: 60 },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      maxlength: 60,
      match: [SLUG_PATTERN, 'Use lowercase letters, numbers and hyphens'],
    },
    description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 300 },
    genre: { type: String, required: [true, 'Genre is required'], enum: GENRES },
    // true = game-agnostic track whose lessons apply to every game of the same genre
    isFundamentals: { type: Boolean, default: false },
    ranks: [{ type: String, trim: true, maxlength: 40 }],
    sections: [{ title: { type: String, required: [true, 'Section title is required'], trim: true, maxlength: 60 } }],
    order: { type: Number, default: 0 },
  },
  schemaOptions,
);

export const Game = mongoose.model('Game', gameSchema);
