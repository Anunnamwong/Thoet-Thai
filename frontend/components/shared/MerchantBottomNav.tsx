"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, UtensilsCrossed, BarChart2, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  Icon: React.ElementType;
  showBadge?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/merchant/dashboard", label: "หน้าหลัก", Icon: LayoutDashboard },
  { href: "/merchant/orders", label: "ออเดอร์", Icon: ClipboardList, showBadge: true },
  { href: "/merchant/menu", label: "เมนู", Icon: UtensilsCrossed },
  { href: "/merchant/revenue", label: "รายได้", Icon: BarChart2 },
  { href: "/merchant/profile", label: "ฉัน", Icon: User },
];

interface MerchantBottomNavProps {
  alertCount?: number;
}

export function MerchantBottomNav({ alertCount = 0 }: MerchantBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="bg-surface-card border-t border-border safe-bottom shrink-0">
      <div className="grid grid-cols-5">
        {NAV_ITEMS.map(({ href, label, Icon, showBadge }) => {
          const isActive = pathname.endsWith(href) || pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 pt-3 min-h-touch",
                isActive ? "text-text-primary" : "text-text-secondary"
              )}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.75} />
                {showBadge && alertCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-brand-primary text-white text-[10px] font-semibold grid place-items-center">
                    {alertCount}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[11px] whitespace-nowrap",
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
