export interface Product {
  id: string; name: string; slug: string; description: string;
  price: number; stock: number; images: string[];
  categoryId: string; category: { id: string; name: string };
  discount?: number | null; isActive: boolean; createdAt: string;
}

export interface Category { id: string; name: string; slug: string; }

export interface OrderItem {
  id: string; productId: string; productName: string;
  quantity: number; price: number;
  product?: { images: string[] };
}

export interface Order {
  id: string; orderNumber: string;
  userId?: string; user?: { name: string; email: string };
  guestName?: string; guestEmail?: string; guestPhone?: string;
  shippingName: string; shippingPhone: string; shippingAddress: string;
  shippingCity: string; shippingProvince: string; shippingPostal: string;
  shippingCost: number; courier?: string; trackingNumber?: string;
  paymentMethod?: string; paymentStatus: string; paidAt?: string;
  status: string; subtotal: number; total: number; notes?: string;
  items: OrderItem[]; createdAt: string; updatedAt: string;
}

export interface ApiResponse<T> { success: boolean; data: T; message?: string; }
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: { total: number; page: number; totalPages: number };
}
