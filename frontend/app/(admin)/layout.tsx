"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Store,
  Bike,
  Banknote,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "ภาพรวม", Icon: LayoutDashboard },
  { href: "/admin/orders", label: "ออเดอร์", Icon: ClipboardList, badgeKey: "orders" },
  { href: "/admin/merchants", label: "ร้านค้า", Icon: Store, badgeKey: "merchants" },
  { href: "/admin/riders", label: "ไรเดอร์", Icon: Bike },
  { href: "/admin/settlement", label: "การชำระ", Icon: Banknote, badgeKey: "settlements" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const { data: statsRes } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.getAdminDashboard() as Promise<ApiResponse<{ recent_orders?: { status: string }[]; pending_merchants?: number }>>,
  });

  const stats = statsRes?.data;
  
  const badges: Record<string, number> = {
    orders: stats?.recent_orders?.filter((o) => ["paid", "preparing"].includes(o.status)).length || 0,
    merchants: stats?.pending_merchants || 0,
    settlements: 0, // Not available in dashboard stats yet
  };

  const handleLogout = async () => {
    if (confirm("ยืนยันการออกจากระบบ?")) {
      await api.logout();
      router.push("/");
    }
  };

  return (
    <div className="flex h-dvh bg-surface-bg">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 bg-surface-card border-r border-border flex flex-col">
        <div className="px-4 py-5 border-b border-border">
          <div className="text-base font-semibold text-text-primary">เทอดไทย</div>
          <div className="text-xs text-brand-primary font-medium mt-0.5">Admin Panel</div>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, Icon, badgeKey }) => {
            const isActive = pathname.startsWith(href);
            const badgeCount = badgeKey ? badges[badgeKey] : 0;
            
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center justify-between mx-2 px-3 py-2.5 rounded-btn text-sm font-medium transition-colors group",
                  isActive
                    ? "bg-brand-primary text-white"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-bg"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon size={17} strokeWidth={isActive ? 2.2 : 1.75} />
                  {label}
                </div>
                {badgeCount > 0 && (
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[18px] text-center",
                    isActive ? "bg-white text-brand-primary" : "bg-brand-primary text-white"
                  )}>
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-border">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-btn text-sm font-medium text-status-danger hover:bg-status-danger-bg transition-colors"
          >
            <LogOut size={17} strokeWidth={1.75} />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
