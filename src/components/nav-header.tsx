"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavHeader() {
  const pathname = usePathname();

  const links = [
    { href: "/past", label: "Past" },
    { href: "/feedback", label: "Feedback" },
  ];

  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3">
        <Link href="/" className="text-lg font-semibold hover:text-foreground">
          The Workshop
        </Link>
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
