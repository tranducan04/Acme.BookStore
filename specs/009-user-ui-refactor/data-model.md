# Data Models & State Specifications: User-Facing UI/UX Modernization & Redesign (009-user-ui-refactor)

**Date**: 2026-10-02  
**Feature**: [spec.md](./spec.md)  
**Status**: Completed  

---

## 1. UI Models & State Interfaces

### 1.1. Storefront Book Representation (`StorefrontBook`)
```typescript
export interface StorefrontBook {
  id: string;
  name: string;
  type: number; // BookType Enum
  categoryName?: string;
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
  ageLimit?: string; // "Thiếu nhi", "Thiếu niên", "Trưởng thành"
  isWishlisted?: boolean;
}
```

### 1.2. Toast Notification Model (`ToastMessage`)
```typescript
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  durationMs?: number; // Mặc định 3500ms
  timestamp: number;
}
```

### 1.3. Theme Configuration (`ThemeState`)
```typescript
export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  mode: ThemeMode;
  storageKey: 'bookstore_theme';
}
```

### 1.4. Catalog Filter & Pagination Query State
```typescript
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
  pageSize: 12 | 24 | 48;
  totalCount: number;
}
```

### 1.5. Checkout Form Model (`CheckoutPayload`)
```typescript
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
```

### 1.6. Order Lifecycle & Timeline Step (`OrderTimelineStep`)
```typescript
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
```

---

## 2. Validation & State Transition Rules

### 2.1. Rule Thả Tim Yêu Thích (Wishlist)
- **State Transition**: `Unfavorited` ➔ `Favorited` (yêu cầu `authService.isAuthenticated === true`).
- Nếu `authService.isAuthenticated === false`, ném thông báo Toast: *"Vui lòng đăng nhập để lưu sách yêu thích"*, lưu `returnUrl` và chuyển hướng sang `/account/login`.

### 2.2. Rule Checkout & Form Validation
- `receiverName`: Bắt buộc, độ dài từ 2 đến 100 ký tự.
- `receiverPhone`: Bắt buộc, đúng định dạng số điện thoại Việt Nam (10 số, bắt đầu bằng `0[3|5|7|8|9]`).
- `deliveryAddress`: Bắt buộc, tối thiểu 10 ký tự.
- `paymentMethod`: Bắt buộc chọn một trong hai (`COD` hoặc `VietQR`).
- `VietQR Dynamic Generation`: Khi chọn `VietQR`, hiển thị mã QR kèm Số tiền chính xác và cú pháp chuyển khoản `ORD-<OrderCode>`.
