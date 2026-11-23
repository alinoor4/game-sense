// error: an ApiError or null
export default function FormError({ error }) {
  if (!error) return null;
  const fields = Object.entries(error.fields);
  return (
    <div className="alert alert-error" role="alert">
      <p>{error.message}</p>
      {fields.length > 0 && (
        <ul>
          {fields.map(([name, message]) => (
            <li key={name}>
              <strong>{name}:</strong> {message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
