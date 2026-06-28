"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface NavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  badge?: number;
}

export function NavItem({ href, icon, label, badge }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-2.5 px-3 py-2 rounded-md text-base transition-all duration-150
        ${isActive
          ? "bg-bg-card text-sb-primary font-medium"
          : "text-text-secondary hover:bg-bg-card hover:text-text-primary"
        }
      `}
    >
      <span className="w-[18px] text-center text-md">{icon}</span>
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto bg-sb-primary text-bg-primary text-label px-1.5 py-px rounded-full font-semibold">
          {badge}
        </span>
      )}
    </Link>
  );
}
