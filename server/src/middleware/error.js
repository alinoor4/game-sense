export class HttpError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export function notFound(req, res) {
  res.status(404).json({ error: { message: 'Not found' } });
}

// Express 5 passes errors thrown in async handlers here automatically.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || 'Server error';
  let fields;

  if (err instanceof HttpError) {
    fields = err.fields;
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    fields = {};
    for (const [path, e] of Object.entries(err.errors)) fields[path] = e.message;
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Invalid value for ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    message = `${Object.keys(err.keyPattern || {}).join(', ') || 'Value'} already exists`;
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Request body is not valid JSON';
  } else if (status >= 500) {
    console.error(err);
    message = 'Server error';
  }

  res.status(status).json({ error: { message, ...(fields ? { fields } : {}) } });
}
