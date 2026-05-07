"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { Camera, Trash2, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { ApiResponse, MenuCategory, MenuItem } from "@/types";
import { useToastStore } from "@/stores/toast";

interface FormState {
  name: string;
  price: string;
  category_id: string;
  description: string;
  is_available: boolean;
  image_url: string;
}

export default function MenuEditorPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToastStore();
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";

  const [form, setForm] = useState<FormState>({
    name: "",
    price: "",
    category_id: "",
    description: "",
    is_available: true,
    image_url: "",
  });

  const [uploading, setUploading] = useState(false);

  const { data: shopRes } = useQuery({
    queryKey: ["my-shop"],
    queryFn: () => api.getMyShop() as Promise<ApiResponse<{ id: string }>>,
  });
  const shopId = shopRes?.data?.id;

  const { data: menuRes, isLoading: categoriesLoading } = useQuery({
    queryKey: ["menu", shopId],
    queryFn: () => api.getShopMenu(shopId!) as Promise<ApiResponse<MenuCategory[]>>,
    enabled: !!shopId,
  });

  const { data: itemRes, isLoading: itemLoading } = useQuery({
    queryKey: ["menu-item", id],
    queryFn: () => api.getShopMenu(shopId!).then(res => {
      const items = (res as ApiResponse<MenuCategory[]>).data?.flatMap(c => c.items) || [];
      const item = items.find(i => i.id === id);
      return { success: !!item, data: item } as ApiResponse<MenuItem>;
    }),
    enabled: !!shopId && !isNew,
  });

  useEffect(() => {
    if (itemRes?.data) {
      const item = itemRes.data;
      setForm({
        name: item.name,
        price: item.price.toString(),
        category_id: item.category_id || "",
        description: item.description || "",
        is_available: item.is_available,
        image_url: item.image_url || "",
      });
    }
  }, [itemRes]);

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      isNew
        ? api.createMenuItem({ ...data, shop_id: shopId })
        : api.updateMenuItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu", shopId] });
      router.back();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu", shopId] });
      router.back();
    },
  });

  const categories = useMemo(() => (menuRes?.data || []).filter((category) => category.id), [menuRes?.data]);
  
  // Set default category if none selected and categories available
  useEffect(() => {
    if (isNew && !form.category_id && categories.length > 0) {
      set("category_id", categories[0].id ?? "");
    }
  }, [categories, isNew, form.category_id]);

  const set = (k: keyof FormState, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await api.uploadImage(file);
      if (res.success && res.data?.url) {
        set("image_url", res.data.url);
      }
    } catch (err) {
      toast("อัปโหลดรูปไม่สำเร็จ: " + (err instanceof Error ? err.message : "เกิดข้อผิดพลาด"));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!form.name || !form.price) return;
    saveMutation.mutate({
      name: form.name,
      price: parseInt(form.price),
      category_id: form.category_id || null,
      description: form.description,
      is_available: form.is_available,
      image_url: form.image_url,
    });
  };

  const handleDelete = () => {
    if (confirm("ยืนยันการลบเมนูนี้ใช่ไหม?")) {
      deleteMutation.mutate();
    }
  };

  const inputClass =
    "w-full px-3.5 py-3.5 rounded-[10px] border border-border bg-surface-card text-base text-text-primary outline-none focus:border-brand-primary disabled:opacity-50";

  if (itemLoading || categoriesLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-surface-bg">
        <Loader2 className="animate-spin text-brand-primary mb-2" size={32} />
        <div className="text-sm text-text-secondary">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden relative bg-surface-bg">
      <ScreenHeader
        title={isNew ? "เพิ่มเมนูใหม่" : "แก้ไขเมนู"}
        onBack={() => router.back()}
      />

      <div className="flex-1 overflow-y-auto hide-scrollbar p-4">
        {/* Photo Slot */}
        <div className="relative mb-4">
          <input
            type="file"
            id="menu-photo"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading || saveMutation.isPending}
          />
          <label
            htmlFor="menu-photo"
            className={`w-full rounded-modal grid place-items-center relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all ${
              form.image_url
                ? "aspect-[4/3] bg-border"
                : "aspect-[4/3] bg-surface-card border-2 border-dashed border-border"
            }`}
          >
            {form.image_url ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.image_url} alt="Menu" className="w-full h-full object-cover" />
                <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3.5 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 backdrop-blur-sm">
                  <Camera size={14} />
                  เปลี่ยนรูป
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-brand-primary-light text-brand-primary grid place-items-center">
                  <Camera size={32} strokeWidth={2} />
                </div>
                <div className="text-base font-semibold text-text-primary">ถ่ายรูปเมนู</div>
                <div className="text-sm text-text-secondary">กดเพื่อเปิดกล้องหรือเลือกรูป</div>
              </div>
            )}
            
            {uploading && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
                <Loader2 className="animate-spin mb-2" size={32} />
                <div className="text-sm font-bold">กำลังอัปโหลด...</div>
              </div>
            )}
          </label>
        </div>

        {/* Form fields */}
        <div className="mb-3.5">
          <div className="text-sm font-semibold text-text-primary mb-1.5">
            ชื่อเมนู <span className="text-brand-primary">*</span>
          </div>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="เช่น ข้าวซอยไก่"
            className={inputClass}
            disabled={saveMutation.isPending}
          />
        </div>

        <div className="mb-3.5">
          <div className="text-sm font-semibold text-text-primary mb-1.5">
            ราคา (บาท) <span className="text-brand-primary">*</span>
          </div>
          <input
            type="number"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="0"
            className={inputClass}
            disabled={saveMutation.isPending}
          />
        </div>

        <div className="mb-3.5">
          <div className="text-sm font-semibold text-text-primary mb-1.5">
            หมวดหมู่ <span className="text-brand-primary">*</span>
          </div>
          <select
            value={form.category_id}
            onChange={(e) => set("category_id", e.target.value)}
            className={inputClass}
            disabled={saveMutation.isPending}
          >
            <option value="">เลือกหมวดหมู่</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id ?? ""}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3.5">
          <div className="text-sm font-semibold text-text-primary mb-1.5">
            คำอธิบาย (ไม่บังคับ)
          </div>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="เช่น สูตรไทใหญ่ ใส่กะทิหอม"
            rows={3}
            className={`${inputClass} resize-none h-20`}
            disabled={saveMutation.isPending}
          />
        </div>

        <div className="mb-3.5">
          <div className="text-sm font-semibold text-text-primary mb-1.5">สถานะ</div>
          <button
            onClick={() => set("is_available", !form.is_available)}
            disabled={saveMutation.isPending}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-[10px] border border-border bg-surface-card text-text-primary disabled:opacity-50"
          >
            <span className="text-base">
              {form.is_available ? "มีของ — เปิดขายอยู่" : "ของหมด — ลูกค้าสั่งไม่ได้"}
            </span>
            <div
              className={`w-12 h-7 rounded-full relative transition-colors ${
                !form.is_available ? "bg-border" : "bg-status-success"
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${
                  !form.is_available ? "left-0.5" : "left-6"
                }`}
              />
            </div>
          </button>
        </div>

        {!isNew && (
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending || saveMutation.isPending}
            className="w-full h-[50px] rounded-card mt-2 border-[1.5px] border-status-danger-bg text-status-danger text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {deleteMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={16} />}
            ลบเมนูนี้
          </button>
        )}
      </div>

      <div className="px-4 py-3 pb-4 bg-surface-bg border-t border-border shrink-0">
        <button
          onClick={handleSubmit}
          disabled={saveMutation.isPending || !form.name || !form.price}
          className="w-full h-14 rounded-card bg-brand-primary text-white text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-brand-primary/20"
        >
          {saveMutation.isPending && <Loader2 className="animate-spin" size={20} />}
          {isNew ? "+ เพิ่มเมนูนี้" : "บันทึกการเปลี่ยนแปลง"}
        </button>
      </div>

      {/* Photo sheet (Removed as direct upload is now used) */}
    </div>
  );
}
