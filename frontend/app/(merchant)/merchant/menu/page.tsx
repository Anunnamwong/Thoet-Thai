"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { Plus, Camera, Edit2, Loader2, Pencil, Tag, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";
import { useToastStore } from "@/stores/toast";

interface ShopDetail {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  shop_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
}

interface MenuCategory {
  id: string | null;
  shop_id: string;
  name: string;
  sort_order: number;
  items: MenuItem[];
}

function SkeletonRow() {
  return (
    <div className="bg-surface-card rounded-card border border-border p-3 flex items-center gap-3 animate-pulse">
      <div className="w-[60px] h-[60px] rounded-[10px] bg-border shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-border rounded w-2/3" />
        <div className="h-3 bg-border rounded w-1/3" />
      </div>
      <div className="w-16 h-8 bg-border rounded-lg" />
    </div>
  );
}

export default function MerchantMenuPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToastStore();
  const [activeCat, setActiveCat] = useState("all");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [deletingCategory, setDeletingCategory] = useState<MenuCategory | null>(null);

  const { data: shopData, isLoading: shopLoading } = useQuery({
    queryKey: ["my-shop"],
    queryFn: () => api.getMyShop() as Promise<ApiResponse<ShopDetail>>,
  });

  const shopId = shopData?.data?.id;

  const { data: menuData, isLoading: menuLoading } = useQuery({
    queryKey: ["menu", shopId],
    queryFn: () => api.getShopMenu(shopId!) as Promise<ApiResponse<MenuCategory[]>>,
    enabled: !!shopId,
  });

  const toggleMutation = useMutation({
    mutationFn: (itemId: string) => api.toggleMenuAvailability(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["menu", shopId] }),
  });

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => api.createMenuCategory(shopId!, name),
    onSuccess: () => {
      setNewCategoryName("");
      queryClient.invalidateQueries({ queryKey: ["menu", shopId] });
      toast("เพิ่มหมวดหมู่แล้ว", "success");
    },
    onError: (err) => toast(err instanceof Error ? err.message : "เพิ่มหมวดหมู่ไม่สำเร็จ"),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => api.updateMenuCategory(id, { name }),
    onSuccess: () => {
      setEditingCategory(null);
      setEditingCategoryName("");
      queryClient.invalidateQueries({ queryKey: ["menu", shopId] });
      toast("แก้ไขหมวดหมู่แล้ว", "success");
    },
    onError: (err) => toast(err instanceof Error ? err.message : "แก้ไขหมวดหมู่ไม่สำเร็จ"),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => api.deleteMenuCategory(id),
    onSuccess: () => {
      setDeletingCategory(null);
      setActiveCat("all");
      queryClient.invalidateQueries({ queryKey: ["menu", shopId] });
      toast("ลบหมวดหมู่แล้ว เมนูในหมวดถูกย้ายไปอื่นๆ", "success");
    },
    onError: (err) => toast(err instanceof Error ? err.message : "ลบหมวดหมู่ไม่สำเร็จ"),
  });

  const isLoading = shopLoading || menuLoading;
  const categories = menuData?.data ?? [];
  const editableCategories = categories.filter((c) => c.id !== null);
  const allItems = categories.flatMap((c) => c.items);
  const filtered =
    activeCat === "all"
      ? allItems
      : categories.find((c) => (c.id ?? "uncategorized") === activeCat)?.items ?? [];

  const handleCreateCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    createCategoryMutation.mutate(name);
  };

  const handleRenameCategory = (category: MenuCategory) => {
    if (!category.id) return;
    setEditingCategory(category);
    setEditingCategoryName(category.name);
  };

  const handleDeleteCategory = (category: MenuCategory) => {
    if (!category.id) return;
    setDeletingCategory(category);
  };

  const submitRenameCategory = () => {
    if (!editingCategory?.id) return;
    const nextName = editingCategoryName.trim();
    if (!nextName || nextName === editingCategory.name) return;
    updateCategoryMutation.mutate({ id: editingCategory.id, name: nextName });
  };

  const submitDeleteCategory = () => {
    if (!deletingCategory?.id) return;
    deleteCategoryMutation.mutate(deletingCategory.id);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ScreenHeader
        title="จัดการเมนู"
        sub={isLoading ? "กำลังโหลด..." : `ทั้งหมด ${allItems.length} รายการ`}
        right={
          <button
            onClick={() => router.push("/merchant/menu/new")}
            className="w-11 h-11 rounded-card bg-brand-primary text-white grid place-items-center mr-2 shrink-0"
          >
            <Plus size={22} strokeWidth={2.4} />
          </button>
        }
      />

      <div className="px-4 pt-3 pb-2 border-b border-border shrink-0">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">หมวดหมู่เมนู</h2>
            <p className="text-xs text-text-secondary mt-0.5">จัดกลุ่มเมนูให้ลูกค้าเลือกง่ายขึ้น</p>
          </div>
          <Tag size={18} className="text-brand-primary shrink-0" />
        </div>

        <div className="flex gap-2">
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateCategory();
            }}
            placeholder="เช่น เมนูแนะนำ"
            className="min-w-0 flex-1 h-11 px-3.5 rounded-[10px] border border-border bg-surface-card text-sm text-text-primary outline-none focus:border-brand-primary disabled:opacity-60"
            disabled={!shopId || createCategoryMutation.isPending}
          />
          <button
            onClick={handleCreateCategory}
            disabled={!shopId || !newCategoryName.trim() || createCategoryMutation.isPending}
            className="w-11 h-11 rounded-[10px] bg-brand-primary text-white grid place-items-center shrink-0 disabled:opacity-60"
            aria-label="เพิ่มหมวดหมู่"
          >
            {createCategoryMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
          </button>
        </div>

        {editableCategories.length > 0 && (
          <div className="flex gap-2 mt-2.5 overflow-x-auto hide-scrollbar">
            {editableCategories.map((category) => (
              <div
                key={category.id}
                className="h-10 px-3 rounded-full border border-border bg-surface-card flex items-center gap-2 shrink-0"
              >
                <span className="text-sm font-medium text-text-primary">{category.name}</span>
                <button
                  onClick={() => handleRenameCategory(category)}
                  disabled={updateCategoryMutation.isPending}
                  className="w-7 h-7 rounded-full grid place-items-center text-text-secondary disabled:opacity-50"
                  aria-label="แก้ไขหมวดหมู่"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category)}
                  disabled={deleteCategoryMutation.isPending}
                  className="w-7 h-7 rounded-full grid place-items-center text-status-danger disabled:opacity-50"
                  aria-label="ลบหมวดหมู่"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-1.5 px-4 py-3 overflow-x-auto hide-scrollbar shrink-0">
        {[{ id: "all", name: "ทั้งหมด" }, ...categories.map((c) => ({ id: c.id ?? "uncategorized", name: c.name }))].map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.id)}
            className={cn(
              "px-3.5 py-2 rounded-full text-sm font-medium border whitespace-nowrap",
              activeCat === c.id
                ? "bg-text-primary text-white border-text-primary"
                : "bg-transparent text-text-primary border-border"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-3 flex flex-col gap-2">
        {isLoading ? (
          [1, 2, 3, 4].map((n) => <SkeletonRow key={n} />)
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-2">🍽</div>
            <div className="text-sm text-text-secondary">ยังไม่มีเมนูในหมวดนี้</div>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={cn(
                "bg-surface-card rounded-card border border-border p-3 flex items-center gap-3",
                !item.is_available && "opacity-55"
              )}
            >
              <div className="w-[60px] h-[60px] rounded-[10px] bg-border grid place-items-center shrink-0 border border-border overflow-hidden">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <Camera size={20} className="text-text-tertiary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-text-primary truncate">{item.name}</span>
                </div>
                <div className="text-xs text-text-secondary mt-0.5">฿{item.price}</div>
                {item.description && (
                  <div className="text-xs text-text-tertiary mt-0.5 truncate">{item.description}</div>
                )}
              </div>
              <button
                onClick={() => toggleMutation.mutate(item.id)}
                disabled={toggleMutation.isPending && toggleMutation.variables === item.id}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 disabled:opacity-60",
                  !item.is_available
                    ? "bg-status-danger-bg text-status-danger"
                    : "bg-status-success-bg text-status-success"
                )}
              >
                {!item.is_available ? "ของหมด" : "มีของ"}
              </button>
              <button
                onClick={() => router.push(`/merchant/menu/${item.id}`)}
                className="w-10 h-10 rounded-[10px] border border-border bg-surface-card grid place-items-center text-text-primary shrink-0"
              >
                <Edit2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {(editingCategory || deletingCategory) && (
        <div className="fixed inset-0 z-50 bg-black/35 flex items-end">
          <div className="w-full bg-surface-bg rounded-t-modal border-t border-border px-4 pt-3 pb-4 shadow-xl">
            <div className="w-10 h-1 rounded-full bg-border mx-auto mb-3" />

            {editingCategory && (
              <>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-text-primary">แก้ไขชื่อหมวดหมู่</h3>
                    <p className="text-xs text-text-secondary mt-0.5">ชื่อนี้จะแสดงทั้งฝั่งร้านค้าและลูกค้า</p>
                  </div>
                  <button
                    onClick={() => setEditingCategory(null)}
                    disabled={updateCategoryMutation.isPending}
                    className="w-10 h-10 rounded-[10px] border border-border bg-surface-card grid place-items-center text-text-primary disabled:opacity-50"
                    aria-label="ปิด"
                  >
                    <X size={18} />
                  </button>
                </div>
                <input
                  value={editingCategoryName}
                  onChange={(e) => setEditingCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitRenameCategory();
                  }}
                  autoFocus
                  placeholder="ชื่อหมวดหมู่"
                  className="w-full h-12 px-3.5 rounded-[10px] border border-border bg-surface-card text-base text-text-primary outline-none focus:border-brand-primary disabled:opacity-60"
                  disabled={updateCategoryMutation.isPending}
                />
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => setEditingCategory(null)}
                    disabled={updateCategoryMutation.isPending}
                    className="h-12 rounded-card border border-border bg-surface-card text-sm font-semibold text-text-primary disabled:opacity-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={submitRenameCategory}
                    disabled={
                      updateCategoryMutation.isPending ||
                      !editingCategoryName.trim() ||
                      editingCategoryName.trim() === editingCategory.name
                    }
                    className="h-12 rounded-card bg-brand-primary text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {updateCategoryMutation.isPending && <Loader2 size={17} className="animate-spin" />}
                    บันทึก
                  </button>
                </div>
              </>
            )}

            {deletingCategory && (
              <>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-text-primary">ลบหมวดหมู่</h3>
                    <p className="text-sm text-text-secondary mt-1 leading-snug">
                      เมนูในหมวด "{deletingCategory.name}" จะไม่ถูกลบ แต่จะถูกย้ายไปอยู่หมวด "อื่นๆ"
                    </p>
                  </div>
                  <button
                    onClick={() => setDeletingCategory(null)}
                    disabled={deleteCategoryMutation.isPending}
                    className="w-10 h-10 rounded-[10px] border border-border bg-surface-card grid place-items-center text-text-primary disabled:opacity-50 shrink-0"
                    aria-label="ปิด"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => setDeletingCategory(null)}
                    disabled={deleteCategoryMutation.isPending}
                    className="h-12 rounded-card border border-border bg-surface-card text-sm font-semibold text-text-primary disabled:opacity-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={submitDeleteCategory}
                    disabled={deleteCategoryMutation.isPending}
                    className="h-12 rounded-card bg-status-danger text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {deleteCategoryMutation.isPending && <Loader2 size={17} className="animate-spin" />}
                    ลบหมวดหมู่
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
