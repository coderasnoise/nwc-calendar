import { clsx } from "clsx";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "positive" | "alert";
  className?: string;
};

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "neutral" && "bg-slate-100 text-slate-700",
        tone === "positive" && "bg-emerald-100 text-emerald-700",
        tone === "alert" && "bg-red-100 text-red-700",
        className
      )}
    >
      {children}
    </span>
  );
}
