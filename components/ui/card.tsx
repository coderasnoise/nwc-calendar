import { clsx } from "clsx";

type CardProps = {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={clsx("rounded-xl border border-slate-200 bg-white p-5 shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}
