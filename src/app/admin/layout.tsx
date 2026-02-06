"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard" },
  ];

  return (
    <>
      <header className="border-b bg-muted/40">
        <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
          <Link
            href="/admin"
            className="text-lg font-semibold hover:text-foreground"
          >
            The Workshop{" "}
            <span className="text-sm font-normal text-muted-foreground">
              Admin
            </span>
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
          <div className="ml-auto">
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Back to site
            </Link>
          </div>
        </nav>
      </header>
      {children}
    </>
  );
}
