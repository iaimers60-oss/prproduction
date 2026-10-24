"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/admin/actions";

export function SubmitButton({ children, className, variant = "gold" }: { children: React.ReactNode; className?: string; variant?: "gold" | "outline" | "danger" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors disabled:opacity-60",
        variant === "gold" && "bg-gold text-ink hover:bg-gold-soft",
        variant === "outline" && "border border-white/20 text-ivory hover:border-gold hover:text-gold",
        variant === "danger" && "border border-red-400/40 text-red-300 hover:bg-red-400/10",
        className,
      )}
    >
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}

/** Submit button that asks for confirmation first. */
export function ConfirmSubmit({ children, message, className }: { children: React.ReactNode; message: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}
      className={cn("text-xs font-semibold uppercase tracking-[0.15em] text-red-300 hover:text-red-200 disabled:opacity-50", className)}
    >
      {children}
    </button>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (state.error) return <p role="alert" className="border border-red-400/40 bg-red-400/5 px-4 py-3 text-sm text-red-200">{state.error}</p>;
  if (state.ok && state.message) return <p role="status" className="border border-gold/40 bg-gold/5 px-4 py-3 text-sm text-gold-soft">{state.message}</p>;
  return null;
}

interface FieldProps {
  name: string;
  /** Element id when it differs from name (e.g. several forms on one page). */
  id?: string;
  label: string;
  state?: ActionState;
  hint?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  rows?: number;
  placeholder?: string;
}

export function AdminField({ name, id, label, state, hint, className, children, defaultValue, type = "text", required, textarea, rows = 4, placeholder }: FieldProps) {
  const error = state?.fieldErrors?.[name];
  const value = state?.data?.[name] ?? defaultValue ?? "";
  const common = {
    id: name,
    name,
    required,
    placeholder,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${name}-error` : hint ? `${name}-hint` : undefined,
    className: "field py-2.5 text-sm",
  } as const;
  return (
    <div className={className}>
      <label htmlFor={id ?? name} className="field-label">{label}{required && <span className="text-gold"> *</span>}</label>
      {children ??
        (textarea ? (
          <textarea {...common} rows={rows} defaultValue={String(value)} key={String(value)} />
        ) : (
          <input {...common} type={type} defaultValue={String(value)} key={String(value)} />
        ))}
      {hint && !error && <p id={`${name}-hint`} className="mt-1.5 text-xs text-mist/70">{hint}</p>}
      {error && <p id={`${name}-error`} className="mt-1.5 text-xs text-red-300">{error}</p>}
    </div>
  );
}
