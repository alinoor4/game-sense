// A labelled form control with its error message underneath.
// <Field label="Email" error={error?.fields.email}><input type="email" ... /></Field>
// The input sits inside the <label>, so they are linked without needing an id.
export default function Field({ label, error, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <span className="error-text">{error}</span>}
    </label>
  );
}
