"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavHeader() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Upcoming" },
    { href: "/past", label: "Past" },
  ];

  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3">
        <span className="text-lg font-semibold">The Workshop</span>
        <div className="flex gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm transition-colors hover:text-foreground",
                pathname === link.href
                  ? "font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
