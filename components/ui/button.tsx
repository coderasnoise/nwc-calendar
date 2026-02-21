import { clsx } from "clsx";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function buttonStyles({
  variant = "primary",
  className
}: {
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  return clsx(
    "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-60",
    variant === "primary" && "bg-blue-700 text-white hover:bg-blue-800",
    variant === "secondary" && "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
    variant === "ghost" && "text-slate-700 hover:bg-slate-100",
    className
  );
}

export function Button({ className, variant = "primary", type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={buttonStyles({ variant, className })} {...props} />
  );
}
