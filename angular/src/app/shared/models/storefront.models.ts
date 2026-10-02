export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  durationMs?: number;
  timestamp: number;
}

export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  mode: ThemeMode;
  storageKey: 'bookstore_theme';
}

export interface StorefrontBook {
  id: string;
  name: string;
  type: number;
  categoryName?: string;
  categoryId?: string;
  publishDate: string;
  price: number;
  discountPrice?: number;
  discountPercent?: number;
  authorId?: string;
  authorName?: string;
  publisherId?: string;
  publisherName?: string;
  coverImage?: string;
  stockCount: number;
  averageRating: number;
  reviewCount: number;
  ageLimit?: string;
  isWishlisted?: boolean;
}

export function formatAgeLimit(val?: number | string): string {
  const num = Number(val);
  switch (num) {
    case 1:
      return 'Thiếu nhi';
    case 2:
      return 'Thiếu niên';
    case 3:
      return 'Trưởng thành';
    default:
      return 'Mọi lứa tuổi';
  }
}

export interface CatalogFilterState {
  searchQuery: string;
  categoryId?: string;
  authorId?: string;
  minPrice?: number;
  maxPrice?: number;
  ageLimit?: string;
  inStockOnly: boolean;
  sortBy: 'newest' | 'priceAsc' | 'priceDesc' | 'bestSeller';
  page: number;
  pageSize: number;
  totalCount: number;
}

export type PaymentMethod = 'COD' | 'VietQR';

export interface CheckoutForm {
  receiverName: string;
  receiverPhone: string;
  deliveryAddress: string;
  note?: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  discountAmount: number;
  shippingFee: number;
  subtotal: number;
  grandTotal: number;
}

export type OrderStatus = 'Placed' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled';

export interface OrderTimelineStep {
  stepIndex: number;
  status: OrderStatus;
  title: string;
  description: string;
  isCurrent: boolean;
  isCompleted: boolean;
  date?: string;
}
