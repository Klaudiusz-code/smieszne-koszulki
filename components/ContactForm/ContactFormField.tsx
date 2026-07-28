/** Renderuje spójne pole formularza kontaktowego wraz z etykietą i komunikatem błędu. */
const FIELD_CLASS =
  "w-full rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-sm text-black placeholder:text-stone-300 outline-none transition-all focus:border-[#ddb745] focus:ring-2 focus:ring-[#ddb745]/50";

interface ContactFormFieldProps {
  id: string;
  label: string;
  name: string;
  placeholder: string;
  type?: "text" | "email";
  autoComplete?: string;
  required?: boolean;
  maxLength?: number;
  multiline?: boolean;
  rows?: number;
}

export function ContactFormField({
  id,
  label,
  name,
  placeholder,
  type = "text",
  autoComplete,
  required = false,
  maxLength,
  multiline = false,
  rows = 6,
}: ContactFormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-medium uppercase tracking-widest text-stone-500">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          className={`${FIELD_CLASS} resize-none`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          className={FIELD_CLASS}
        />
      )}
    </div>
  );
}
