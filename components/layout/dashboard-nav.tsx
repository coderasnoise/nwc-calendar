"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/patients", label: "Patients" },
  { href: "/calendar", label: "Calendar" },
  { href: "/timeline", label: "Timeline" },
  { href: "/audit", label: "Audit" },
  { href: "/import", label: "Import" }
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
