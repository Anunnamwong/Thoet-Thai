"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, ShoppingBag, User } from "lucide-react";
import { useCartStore } from "@/stores/cart";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  Icon: React.ElementType;
  showBadge?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: "หน้าหลัก", Icon: Home },
  { href: "/orders", label: "คำสั่งซื้อ", Icon: ClipboardList },
  { href: "/cart", label: "ตะกร้า", Icon: ShoppingBag, showBadge: true },
  { href: "/profile", label: "ฉัน", Icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  return (
    <nav className="bg-surface-card border-t border-border safe-bottom">
      <div className="grid grid-cols-4">
        {NAV_ITEMS.map(({ href, label, Icon, showBadge }) => {
          const isActive = pathname === href;
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
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.75}
                />
                {showBadge && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-brand-primary text-white text-[10px] font-semibold grid place-items-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className={cn("text-xs whitespace-nowrap", isActive ? "font-semibold" : "font-medium")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
