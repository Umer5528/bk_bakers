// Every admin input gets a real, visible label (never placeholder-only),
// an optional one-line hint in plain words, and an inline error.
const FormField = ({ label, hint, error, required = false, optional = false, htmlFor, children, className = "" }) => (
  <div className={className}>
    <label htmlFor={htmlFor} className="form-label">
      {label}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
      {optional && <span className="ml-1.5 text-xs font-normal text-mauve-400">(optional)</span>}
    </label>
    {hint && <p className="form-hint">{hint}</p>}
    {children}
    {error && <p className="field-error">{error}</p>}
  </div>
);

export default FormField;
