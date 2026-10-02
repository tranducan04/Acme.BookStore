# Storefront Component & Interface Contracts: User-Facing UI/UX Modernization (009-user-ui-refactor)

**Date**: 2026-10-02  
**Feature**: [spec.md](../spec.md)  
**Status**: Completed  

---

## 1. Danh Mục 14 Reusable Components & Contract Specs

### 1.1. `AnnouncementBarComponent`
- **Selector**: `app-announcement-bar`
- **Inputs**:
  - `message = input<string>('🎉 Miễn phí vận chuyển cho đơn hàng từ 250.000₫!')`
  - `dismissible = input<boolean>(true)`
- **Outputs**:
  - `closed = output<void>()`

### 1.2. `UserHeaderComponent`
- **Selector**: `app-user-header`
- **Inputs**:
  - `cartCount = input<number>(0)`
  - `wishlistCount = input<number>(0)`
  - `unreadNotificationCount = input<number>(0)`
  - `currentTheme = input<'light' | 'dark'>('light')`
- **Outputs**:
  - `searchSubmit = output<string>()`
  - `themeToggle = output<void>()`

### 1.3. `UserFooterComponent`
- **Selector**: `app-user-footer`
- **Inputs**: Không có (sử dụng token thương hiệu chuẩn hóa)
- **Outputs**: Không có

### 1.4. `SearchBarComponent`
- **Selector**: `app-search-bar`
- **Inputs**:
  - `placeholder = input<string>('Tìm kiếm tựa sách, tác giả, thể loại...')`
  - `initialValue = input<string>('')`
- **Outputs**:
  - `search = output<string>()`

### 1.5. `BookCardComponent`
- **Selector**: `app-book-card`
- **Inputs**:
  - `book = input.required<StorefrontBook>()`
  - `showFavoriteBtn = input<boolean>(true)`
- **Outputs**:
  - `addToCart = output<StorefrontBook>()`
  - `toggleFavorite = output<StorefrontBook>()`
  - `viewDetail = output<string>()` // bookId

### 1.6. `CategoryCardComponent`
- **Selector**: `app-category-card`
- **Inputs**:
  - `category = input.required<{ id: string; name: string; icon: string; count?: number }>()`
- **Outputs**:
  - `selected = output<string>()` // categoryId

### 1.7. `StarRatingComponent`
- **Selector**: `app-star-rating`
- **Inputs**:
  - `rating = input<number>(5)`
  - `readOnly = input<boolean>(true)`
  - `showScore = input<boolean>(true)`
- **Outputs**:
  - `ratingChange = output<number>()`

### 1.8. `PriceTagComponent`
- **Selector**: `app-price-tag`
- **Inputs**:
  - `price = input.required<number>()`
  - `discountPrice = input<number | undefined>(undefined)`
  - `showBadge = input<boolean>(true)`

### 1.9. `QuantitySelectorComponent`
- **Selector**: `app-quantity-selector`
- **Inputs**:
  - `quantity = input<number>(1)`
  - `min = input<number>(1)`
  - `max = input<number>(99)`
- **Outputs**:
  - `quantityChange = output<number>()`

### 1.10. `EmptyStateComponent`
- **Selector**: `app-empty-state`
- **Inputs**:
  - `icon = input<string>('fa-box-open')`
  - `title = input<string>('Không có dữ liệu')`
  - `description = input<string>('')`
  - `actionText = input<string | undefined>(undefined)`
- **Outputs**:
  - `actionClick = output<void>()`

### 1.11. `LoadingSkeletonComponent`
- **Selector**: `app-loading-skeleton`
- **Inputs**:
  - `type = input<'card' | 'list' | 'detail' | 'banner'>('card')`
  - `count = input<number>(4)`

### 1.12. `OrderStatusBadgeComponent`
- **Selector**: `app-order-status-badge`
- **Inputs**:
  - `status = input.required<OrderStatus>()`

### 1.13. `OrderTimelineComponent`
- **Selector**: `app-order-timeline`
- **Inputs**:
  - `steps = input.required<OrderTimelineStep[]>()`

### 1.14. `ToastNotificationComponent`
- **Selector**: `app-toast-notification`
- **Inputs**:
  - `toasts = input.required<ToastMessage[]>()`
- **Outputs**:
  - `dismiss = output<string>()` // toastId

---

## 2. Storefront Routing Contracts

| Đường dẫn (Route) | Component Phụ Trách | Mục Đích & Quyền Hạn |
| :--- | :--- | :--- |
| `/` | `HomeComponent` | Trang chủ: Hero slider, Sách nổi bật, Sách mới, Danh mục |
| `/books` | `BookCatalogComponent` | Danh mục sách: Sidebar lọc đa tiêu chí, phân trang số |
| `/books/:id` | `BookDetailComponent` | Chi tiết sách: 2 cột, tab thông tin, đánh giá, sách liên quan |
| `/cart` | `CartComponent` | Giỏ hàng: danh sách món, sửa số lượng, áp coupon, sang checkout |
| `/checkout` | `CheckoutComponent` | Đặt hàng & thanh toán chuyên biệt: 2 cột (Auth Required) |
| `/my-orders` / `/orders` | `OrderComponent` | Quản lý đơn hàng cá nhân: lọc trạng thái, timeline, VietQR (Auth) |
| `/wishlist` | `WishlistComponent` | Danh sách yêu thích cá nhân (Auth Required) |
| `/notifications` | `NotificationComponent` | Trung tâm thông báo hệ thống và đơn hàng (Auth Required) |
| `/about` | `AboutComponent` | Câu chuyện thương hiệu, thư viện số và cam kết |
| `/contact` | `ContactComponent` | Thông tin liên hệ và form gửi câu hỏi hỗ trợ |
