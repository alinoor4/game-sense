import mongoose from 'mongoose';
import { LINEUP_KINDS, SLUG_PATTERN } from '../constants.js';
import { schemaOptions } from './options.js';

// Positions are fractions of the map image: x 0 = left edge, 1 = right edge; y 0 = top, 1 = bottom.
const coordinate = { type: Number, required: [true, 'Position is required'], min: 0, max: 1 };
const pointSchema = new mongoose.Schema({ x: coordinate, y: coordinate }, { _id: false });

// Named GameMap because Map is a JavaScript built-in.
const gameMapSchema = new mongoose.Schema(
  {
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: [true, 'Game is required'] },
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: 2, maxlength: 60 },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      maxlength: 60,
      match: [SLUG_PATTERN, 'Use lowercase letters, numbers and hyphens'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
      maxlength: 500,
      match: [/^(\/maps\/[a-z0-9-]+\.(svg|png|jpg|webp)|https:\/\/\S+)$/, 'Use /maps/<file> or an https link'],
    },
    callouts: [{ name: { type: String, required: [true, 'Callout name is required'], trim: true, maxlength: 40 }, x: coordinate, y: coordinate }],
    lineups: [
      {
        title: { type: String, required: [true, 'Lineup title is required'], trim: true, maxlength: 80 },
        kind: { type: String, required: [true, 'Lineup kind is required'], enum: LINEUP_KINDS },
        // from = where the player stands, to = where the utility lands
        from: { type: pointSchema, required: [true, 'Standing position is required'] },
        to: { type: pointSchema, required: [true, 'Landing position is required'] },
        steps: { type: String, required: [true, 'Steps are required'], maxlength: 1000 },
      },
    ],
  },
  schemaOptions,
);

export const GameMap = mongoose.model('GameMap', gameMapSchema);
