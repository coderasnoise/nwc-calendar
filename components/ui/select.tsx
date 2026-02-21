import { clsx } from "clsx";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={clsx(
        "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600",
        className
      )}
      {...props}
    />
  );
}
