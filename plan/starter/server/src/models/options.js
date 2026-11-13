// Shared by every schema: API responses use `id` (string) instead of `_id`, and never include `__v`.
// passwordHash is removed here because `select: false` only hides it on queries, not on a freshly created document.
export const schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform(doc, ret) {
      delete ret._id;
      delete ret.passwordHash;
      return ret;
    },
  },
};
