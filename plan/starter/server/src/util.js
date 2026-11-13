// Copies only the named keys that are present. Use it on every req.body so clients cannot set fields like `role`.
export function pick(source, keys) {
  const out = {};
  if (source && typeof source === 'object') {
    for (const key of keys) {
      if (source[key] !== undefined) out[key] = source[key];
    }
  }
  return out;
}

// True for a 24-character hex string, the only form of id this API accepts.
export function isId(value) {
  return typeof value === 'string' && /^[0-9a-f]{24}$/i.test(value);
}
