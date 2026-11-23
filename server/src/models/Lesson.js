import mongoose from 'mongoose';
import { DIFFICULTIES, SKILLS, DEMOS, DRILL_TOOLS, SLUG_PATTERN } from '../constants.js';
import { schemaOptions } from './options.js';

const lessonSchema = new mongoose.Schema(
  {
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: [true, 'Game is required'], index: true },
    // id of one of the game's embedded sections; the admin route checks it belongs to the game
    section: { type: mongoose.Schema.Types.ObjectId, required: [true, 'Section is required'] },
    title: { type: String, required: [true, 'Title is required'], trim: true, minlength: 2, maxlength: 100 },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      trim: true,
      maxlength: 100,
      match: [SLUG_PATTERN, 'Use lowercase letters, numbers and hyphens'],
    },
    summary: { type: String, required: [true, 'Summary is required'], trim: true, maxlength: 200 },
    body: { type: String, required: [true, 'Body is required'], maxlength: 20000 },
    order: { type: Number, default: 0 },
    difficulty: { type: String, required: [true, 'Difficulty is required'], enum: DIFFICULTIES },
    skill: { type: String, enum: ['', ...SKILLS], default: '' },
    demo: { type: String, enum: ['', ...DEMOS], default: '' },
    clipUrl: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
      match: [/^https:\/\/\S+\.(webm|mp4)$/, 'Must be an https link ending in .webm or .mp4'],
    },
    drills: [
      {
        name: { type: String, required: [true, 'Drill name is required'], trim: true, maxlength: 80 },
        tool: { type: String, required: [true, 'Drill tool is required'], enum: DRILL_TOOLS },
        minutes: { type: Number, required: [true, 'Drill minutes are required'], min: 1, max: 120 },
      },
    ],
    playlistCode: { type: String, trim: true, maxlength: 100, default: '' },
    published: { type: Boolean, default: false },
  },
  schemaOptions,
);

// A slug only has to be unique inside its game.
lessonSchema.index({ game: 1, slug: 1 }, { unique: true });

export const Lesson = mongoose.model('Lesson', lessonSchema);
