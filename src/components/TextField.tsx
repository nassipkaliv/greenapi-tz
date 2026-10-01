import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "placeholder"> {
  label: string;
}

export function TextField({ label, className = "", ...props }: TextFieldProps) {
  return (
    <label className={`relative block ${className}`}>
      <input
        {...props}
        placeholder=" "
        className="peer w-full rounded-xl border border-line bg-surface px-4 py-3.5 transition outline-none hover:border-accent focus:border-accent focus:shadow-[inset_0_0_0_1px_var(--color-accent)]"
      />
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 bg-surface px-1 text-muted transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs">
        {label}
      </span>
    </label>
  );
}
