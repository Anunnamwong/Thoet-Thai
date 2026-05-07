// ============================================================
// Shared TypeScript Types
// Mirror of database schema + API contracts
// ============================================================

// --- Enums ---

export type UserRole = "customer" | "merchant" | "rider" | "admin";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "preparing"
  | "ready_for_pickup"
  | "rider_assigned"
  | "picked_up"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "promptpay" | "cod";
export type PaymentStatus = "pending" | "confirmed" | "refunded";
export type RiderStatus = "offline" | "online" | "on_job";
export type ShopStatus = "pending_approval" | "active" | "suspended" | "closed";

// --- API Response ---

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  meta: {
    page?: number;
    total?: number;
    has_next?: boolean;
  } | null;
}

// --- User ---

export interface User {
  id: string;
  line_user_id?: string;
  phone?: string;
  display_name: string;
  avatar_url?: string;
  email?: string;
  role: UserRole;
  is_active: boolean;
  pdpa_consent_at?: string;
  created_at: string;
}

// --- Address ---

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_address: string;
  house_number?: string;
  moo?: string;
  soi?: string;
  road?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  note?: string;
  is_default: boolean;
}

// --- Shop ---

export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  phone?: string;
  status: ShopStatus;
  is_open: boolean;
  full_address?: string;
  latitude?: number;
  longitude?: number;
  cuisine_types: string[];
  avg_cooking_time: number;
  minimum_order: number;
  delivery_fee: number;
  commission_rate: number;
}

export interface ShopHours {
  id: string;
  shop_id: string;
  day: string;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

// --- Menu ---

export interface MenuCategory {
  id: string | null;
  shop_id: string;
  name: string;
  sort_order: number;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  shop_id: string;
  category_id?: string | null;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  options: MenuOption[];
}

export interface MenuOption {
  name: string;
  required: boolean;
  choices: MenuChoice[];
}

export interface MenuChoice {
  label: string;
  extra_price: number;
}

// --- Cart (client-side) ---

export interface CartItem {
  menu_item_id: string;
  menu_item: MenuItem; // snapshot for display
  quantity: number;
  selected_options: SelectedOption[];
  special_note?: string;
  line_total: number;
}

export interface SelectedOption {
  name: string;
  choice: string;
  extra_price: number;
}

// --- Order ---

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  shop_id: string;
  rider_id?: string;
  status: OrderStatus;
  delivery_address: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  delivery_note?: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  cooking_time?: number;
  estimated_ready_at?: string;
  estimated_delivery?: string;
  rider_latitude?: number;
  rider_longitude?: number;
  rider_name?: string;
  rider_phone?: string;
  delivered_at?: string;
  cancelled_at?: string;
  cancel_reason?: string;
  promo_code?: string;
  items: OrderItem[];
  shop: Shop;
  rider?: User;
  created_at: string;
}

export interface OrderItem {
  id: string;
  menu_item_id: string;
  item_name: string;
  item_price: number;
  quantity: number;
  selected_options: SelectedOption[];
  special_note?: string;
  line_total: number;
}

export interface OrderListItem {
  id: string;
  order_number: string;
  shop_id: string;
  shop_name?: string;
  status: OrderStatus;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  item_count: number;
  created_at: string;
}

// --- Payment ---

export interface Payment {
  id: string;
  order_id: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  qr_payload?: string;
  slip_image_url?: string;
}

// --- Rider ---

export interface RiderProfile {
  id: string;
  user_id: string;
  status: RiderStatus;
  vehicle_type: string;
  license_plate?: string;
  current_latitude?: number;
  current_longitude?: number;
  total_deliveries: number;
  total_earnings: number;
}

export interface DeliveryJob {
  id: string;
  order_id: string;
  rider_id?: string;
  status: string;
  delivery_fee: number;
  tip: number;
  distance_km?: number;
  order: Order;
  assigned_at?: string;
  delivered_at?: string;
}

// --- Settlement ---

export interface Settlement {
  id: string;
  recipient_id: string;
  recipient_type: UserRole;
  period_start: string;
  period_end: string;
  gross_amount: number;
  commission: number;
  net_amount: number;
  status: string;
  paid_at?: string;
  transfer_slip?: string;
}

// --- Notification ---

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

// --- Create/Update DTOs ---

export interface CreateOrderRequest {
  shop_id: string;
  items: {
    menu_item_id: string;
    item_price: number;
    quantity: number;
    selected_options: SelectedOption[];
    special_note?: string;
  }[];
  delivery_address: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  delivery_note?: string;
  payment_method: PaymentMethod;
  promo_code?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  cooking_time?: number;
  prep_time_mins?: number;
  cancel_reason?: string;
  proof_image_url?: string;
}

export interface CreateMenuItemRequest {
  shop_id: string;
  category_id?: string | null;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  options?: MenuOption[];
}

export interface UpdateRiderLocationRequest {
  latitude: number;
  longitude: number;
}
