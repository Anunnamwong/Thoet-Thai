"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, DollarSign, History, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type RiderNavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
  showBadge?: boolean;
};

const NAV_ITEMS: readonly RiderNavItem[] = [
  { href: "/rider/dashboard", label: "หน้าหลัก", Icon: Home },
  { href: "/rider/earnings", label: "รายได้", Icon: DollarSign },
  { href: "/rider/history", label: "งานของฉัน", Icon: History, showBadge: true },
  { href: "/rider/profile", label: "ฉัน", Icon: User },
];

interface RiderBottomNavProps {
  online?: boolean;
  alertCount?: number;
}

export function RiderBottomNav({ online, alertCount = 0 }: RiderBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "border-t safe-bottom shrink-0",
        online ? "bg-brand-secondary/90 border-white/20" : "bg-surface-card border-border"
      )}
    >
      <div className="grid grid-cols-4">
        {NAV_ITEMS.map(({ href, label, Icon, showBadge }) => {
          const isActive = pathname.endsWith(href) || pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 pt-3 min-h-touch",
                online
                  ? isActive
                    ? "text-white"
                    : "text-white/60"
                  : isActive
                  ? "text-text-primary"
                  : "text-text-secondary"
              )}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.75} />
                {showBadge && alertCount > 0 && (
                  <span className={cn(
                    "absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-semibold grid place-items-center shadow-sm",
                    online ? "bg-white text-brand-secondary" : "bg-brand-primary text-white"
                  )}>
                    {alertCount}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs whitespace-nowrap",
                  isActive ? "font-semibold" : "font-medium"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
