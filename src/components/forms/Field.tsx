import { cn } from "@/lib/utils";

interface Props {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

/** Label + control + accessible error/hint wiring. Pass aria props to the control yourself via fieldProps(). */
export function Field({ id, label, required, error, hint, className, children }: Props) {
  return (
    <div className={cn("flex flex-col", className)}>
      <label htmlFor={id} className="field-label">
        {label} {required ? <span className="text-gold" aria-hidden>*</span> : <span className="font-normal normal-case tracking-normal text-mist/60">(optional)</span>}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="mt-2 text-xs text-mist/70">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  );
}

export function fieldProps(id: string, error?: string, hint?: string) {
  return {
    id,
    name: id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
    className: "field",
  } as const;
}
