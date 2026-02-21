import { clsx } from "clsx";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600",
        className
      )}
      {...props}
    />
  );
}
