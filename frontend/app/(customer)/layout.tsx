import { BottomNav } from "@/components/shared/BottomNav";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-dvh max-w-md mx-auto overflow-hidden">
      <main className="flex-1 overflow-hidden flex flex-col">{children}</main>
      <BottomNav />
    </div>
  );
}
