// Every server call goes through api(). It throws ApiError with the server's message and field errors.
export class ApiError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields || {};
  }
}

// api('GET', '/catalog')  or  api('POST', '/auth/login', { email, password })
// The path is written without the /api prefix. Cookies are sent automatically (same origin).
export async function api(method, path, body) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Is it running?');
  }
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // a non-JSON error page; handled below through res.ok
  }
  if (!res.ok) {
    throw new ApiError(res.status, data?.error?.message || `Request failed (${res.status})`, data?.error?.fields);
  }
  return data;
}
