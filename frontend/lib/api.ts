import type { ApiResponse, OrderListItem, RiderProfile, RiderStatus } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class ApiClient {
  constructor() {
    // No longer reading from localStorage for security
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: "include", // Essential for sending/receiving httpOnly cookies
    });

    if (response.status === 401) {
      // Try refresh token via cookie
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry original request
        const retryResponse = await fetch(`${API_BASE}${path}`, {
          ...options,
          headers,
          credentials: "include",
        });
        
        if (!retryResponse.ok) {
          const error = await retryResponse.json().catch(() => ({}));
          throw new Error(error.detail || `Request failed with status ${retryResponse.status}`);
        }
        return retryResponse.json();
      }
      // Redirect to login if not already there
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    if (response.status === 403) {
      // Role mismatch or forbidden - force back to role selection
      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        console.warn("[API] 403 Forbidden - Redirecting to landing page");
        window.location.href = "/";
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // --- Auth ---
  async devLogin(role: string) {
    return this.request<{ access_token: string; refresh_token: string; user: unknown }>("/auth/dev-login", {
      method: "POST",
      body: JSON.stringify({ role }),
    });
  }

  async loginWithLine(liffAccessToken: string, role: string) {
    return this.request<{ access_token: string; user: unknown }>("/auth/line", {
      method: "POST",
      body: JSON.stringify({ liff_access_token: liffAccessToken, role }),       
    });
  }

  async logout() {
    return this.request<unknown>("/auth/logout", { method: "POST" });
  }

  async getMe() {
    return this.request<unknown>("/auth/me");
  }

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    
    // Note: Can't use this.request for FormData because it forces JSON content-type
    const response = await fetch(`${API_BASE}/misc/upload`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Upload failed with status ${response.status}`);
    }

    return response.json();
  }



  async updateProfile(data: Record<string, unknown>) {
    return this.request<unknown>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async getAddresses() {
    return this.request<unknown[]>("/users/me/addresses");
  }

  async createAddress(data: Record<string, unknown>) {
    return this.request<unknown>("/users/me/addresses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAddress(id: string, data: Record<string, unknown>) {
    return this.request<unknown>(`/users/me/addresses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteAddress(id: string) {
    return this.request<unknown>(`/users/me/addresses/${id}`, {
      method: "DELETE",
    });
  }

  // --- Shops ---
  async getShops(params?: Record<string, string>) {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";   
    return this.request<unknown>(`/shops${query}`);
  }

  async getShop(id: string) {
    return this.request<unknown>(`/shops/${id}`);
  }

  async getShopMenu(id: string) {
    return this.request<unknown>(`/shops/${id}/menu`);
  }

  async toggleShop(id: string) {
    return this.request<unknown>(`/shops/${id}/toggle`, { method: "PATCH" });   
  }

  // --- Menu ---
  async createMenuItem(data: unknown) {
    return this.request<unknown>("/menu", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMenuItem(id: string, data: unknown) {
    return this.request<unknown>(`/menu/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async toggleMenuAvailability(id: string) {
    return this.request<unknown>(`/menu/${id}/availability`, { method: "PATCH" });
  }

  async deleteMenuItem(id: string) {
    return this.request<unknown>(`/menu/${id}`, { method: "DELETE" });
  }

  async createMenuCategory(shopId: string, name: string) {
    return this.request<unknown>("/menu/categories", {
      method: "POST",
      body: JSON.stringify({ shop_id: shopId, name }),
    });
  }

  async updateMenuCategory(id: string, data: { name?: string; sort_order?: number }) {
    return this.request<unknown>(`/menu/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteMenuCategory(id: string) {
    return this.request<unknown>(`/menu/categories/${id}`, {
      method: "DELETE",
    });
  }

  // --- Orders ---
  async validateOrder(data: unknown) {
    return this.request<{ valid: boolean; reason?: string }>("/orders/validate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createOrder(data: unknown) {
    return this.request<unknown>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getOrders(params?: Record<string, string>) {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";   
    return this.request<OrderListItem[]>(`/orders${query}`);
  }

  async getOrder(id: string) {
    return this.request<unknown>(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, data: unknown) {
    return this.request<unknown>(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async cancelOrder(id: string, reason: string) {
    return this.request<unknown>(`/orders/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  }

  // --- Payments ---
  async generatePromptPayQR(orderId: string) {
    return this.request<unknown>("/payments/promptpay", {
      method: "POST",
      body: JSON.stringify({ order_id: orderId }),
    });
  }

  async mockConfirmPromptPay(orderId: string, slipImageUrl?: string) {
    return this.request<unknown>("/payments/promptpay/mock-confirm", {
      method: "POST",
      body: JSON.stringify({ order_id: orderId, slip_image_url: slipImageUrl ?? null }),
    });
  }

  // --- Riders ---
  async updateRiderStatus(status: RiderStatus) {
    return this.request<{ status: RiderStatus }>("/riders/status", {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async updateRiderLocation(lat: number, lng: number) {
    return this.request<unknown>("/riders/location", {
      method: "PATCH",
      body: JSON.stringify({ latitude: lat, longitude: lng }),
    });
  }

  async acceptJob(jobId: string) {
    return this.request<{ order_id: string }>(`/riders/jobs/${jobId}/accept`, { method: "POST" });
  }

  async rejectJob(jobId: string) {
    return this.request<unknown>(`/riders/jobs/${jobId}/reject`, { method: "POST" });
  }

  async updateRiderJobStatus(jobId: string, status: string) {
    return this.request<{
      id: string;
      order_id: string;
      status: string;
      delivered_at: string | null;
    }>(`/riders/jobs/${jobId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async getCurrentJob() {
    return this.request<unknown>("/riders/current-job");
  }

  async getRiderProfile() {
    return this.request<RiderProfile>("/riders/profile");
  }

  async getRiderEarnings(params?: Record<string, string>) {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";   
    return this.request<unknown>(`/riders/earnings${query}`);
  }

  async getRiderHistory(params?: Record<string, string>) {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";   
    return this.request<unknown>(`/riders/history${query}`);
  }

  async getMyShop() {
    return this.request<unknown>("/shops/mine");
  }

  async getMerchantRevenue() {
    return this.request<unknown>("/shops/mine/revenue");
  }

  async getMyShopHours() {
    return this.request<unknown>("/shops/mine/hours");
  }

  async updateMyShopHours(items: unknown[]) {
    return this.request<unknown>("/shops/mine/hours", {
      method: "PUT",
      body: JSON.stringify(items),
    });
  }

  // --- Admin ---
  async adminLogin(email: string, password: string) {
    return this.request<unknown>("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getAdminDashboard() {
    return this.request<unknown>("/admin/dashboard");
  }

  async getAdminMerchants(params?: Record<string, string>) {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";   
    return this.request<unknown>(`/admin/merchants${query}`);
  }

  async approveMerchant(id: string) {
    return this.request<unknown>(`/admin/merchants/${id}/approve`, { method: "PATCH" });
  }

  async suspendMerchant(id: string) {
    return this.request<unknown>(`/admin/merchants/${id}/suspend`, { method: "PATCH" });
  }

  async getAdminRiders(params?: Record<string, string>) {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";   
    return this.request<unknown>(`/admin/riders${query}`);
  }

  async approveRider(userId: string) {
    return this.request<unknown>(`/admin/riders/${userId}/approve`, { method: "PATCH" });
  }

  async getAdminSettlements(params?: Record<string, string>) {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";   
    return this.request<unknown>(`/admin/settlements${query}`);
  }

  async confirmSettlement(id: string) {
    return this.request<unknown>(`/admin/settlements/${id}/confirm`, { method: "POST" });
  }

  async downloadSettlementsCsv() {
    const response = await fetch(`${API_BASE}/admin/settlements/export`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Export failed");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `settlements_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

export const api = new ApiClient();
