import { clsx } from "clsx";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={clsx(
        "h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600",
        className
      )}
      {...props}
    />
  );
}
