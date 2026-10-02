# Research & Architecture Decisions: User-Facing UI/UX Modernization & Redesign (009-user-ui-refactor)

**Date**: 2026-10-02  
**Feature**: [spec.md](./spec.md)  
**Status**: Completed  

---

## 1. Kiến Trúc Design Tokens & Dark Mode Strategy

### Vấn đề cần giải quyết
Hệ thống cần áp dụng bảng màu Thư viện Số hiện đại (Xanh dương `#1e40af`/`#2563eb` + Trắng `#ffffff`/`#f8fafc`) và đồng thời hỗ trợ Chế độ Tối (Dark Navy `#0b1329`, Surface `#111c44`, Text `#f8fafc`) theo quyết định tại phiên clarify mà **tuyệt đối không làm vỡ hoặc ảnh hưởng tới LeptonX Admin UI**.

### Quyết định kỹ thuật (Decision)
- Xây dựng hệ thống CSS Variables trong `angular/src/styles.scss` (hoặc `storefront-tokens.scss`) áp dụng qua selector `[data-theme="dark"]` trên thẻ `<html>` hoặc scoped class container `storefront-theme`.
- Tạo một `ThemeService` (Angular Standalone Service) quản lý theme state bằng Angular Signals (`currentTheme = signal<'light' | 'dark'>('light')`).
- Khởi tạo theme từ `localStorage.getItem('bookstore_theme')` hoặc fallback về `'light'`. Khi toggle, cập nhật `document.documentElement.setAttribute('data-theme', theme)` và lưu `localStorage`.
- Toàn bộ 14 Reusable Components và các trang Storefront sử dụng CSS Variables:
  - `--bs-bg-main`: Light `#ffffff` / Dark `#0b1329`
  - `--bs-bg-soft`: Light `#f8fafc` / Dark `#111c44`
  - `--bs-text-heading`: Light `#0f172a` / Dark `#f8fafc`
  - `--bs-text-body`: Light `#475569` / Dark `#94a3b8`
  - `--bs-primary`: `#1e40af` (Light) / `#3b82f6` (Dark)
  - `--bs-border`: Light `#e2e8f0` / Dark `#1e293b`

### Rationale & Alternatives Considered
- *Tại sao chọn CSS Variables + Signal ThemeService*: Nhẹ, không cần thư viện bên ngoài, tốc độ chuyển theme tức thì (<5ms) không nhấp nháy, kiểm soát chính xác 100% màu sắc.
- *Phương án bị loại bỏ*: Thư viện UI nặng như Tailwind / Angular Material (tránh phình bundle và xung đột với CSS LeptonX của ABP).

---

## 2. Storefront Layout & Độc Lập Khỏi Admin UI (Layout Isolation)

### Vấn đề cần giải quyết
Phạm vi spec nghiêm cấm can thiệp hoặc làm vỡ giao diện Quản trị (`/admin/*`, `/dashboard`, `/books` admin mode). Cần có cơ chế phân tách rõ ràng khi người dùng truy cập Storefront vs Admin.

### Quyết định kỹ thuật (Decision)
- **Storefront Layout**: Tạo `StorefrontLayoutComponent` (chứa `AnnouncementBarComponent`, `UserHeaderComponent`, `<router-outlet>`, `UserFooterComponent`, và cụm 2 floating chats `FloatingChatsComponent`).
- Cấu hình route Storefront sử dụng `StorefrontLayoutComponent` làm layout cha, tách riêng khỏi `DynamicLayoutComponent` (LeptonX Lite) của Admin.
- Khi người dùng là khách hàng hoặc vào trang mua sắm, họ sẽ nhìn thấy 100% Storefront Thư viện Số mới. Khi Admin vào các trang quản trị (`/dashboard`, `/admin-orders`, `/authors`, `/categories`, `/publishers`), ABP Dynamic Layout sẽ hiển thị như thiết kế ban đầu.

---

## 3. Quản Lý Trạng Thái Giao Diện (State Management with Signals)

### Vấn đề cần giải quyết
Tuân thủ Điều khoản II của Hiến pháp Acme.BookStore: Quản lý trạng thái bằng Angular Signals (`signal()`, `computed()`), dữ liệu một chiều, loại bỏ hoàn toàn `alert()` và Bootstrap modal.

### Quyết định kỹ thuật (Decision)
1. **Toast Notification System**:
   - `ToastService`: Quản lý danh sách toast active bằng signal: `toasts = signal<ToastMessage[]>([])`.
   - Cung cấp các helper methods: `showSuccess(msg)`, `showError(msg)`, `showInfo(msg)`, `showWarning(msg)`.
   - Tự động xóa toast sau 3.5 giây với hiệu ứng mờ dần (fade-out).
2. **Cart & Badge Synchronization**:
   - Tái sử dụng `CartSignalStore` (`angular/src/app/features/user/Carts/cart-signal.store.ts`).
   - Header liên kết trực tiếp với `cartStore.totalCount()` qua `computed()`.
3. **Modal & Drawer State**:
   - Sử dụng signal cục bộ hoặc service signal (`isModalOpen = signal(false)`), backdrop và animation bằng CSS/Angular transitions.

---

## 4. Bố Cục Hai Floating Chat Widgets (Live Support & AI Bot)

### Vấn đề cần giải quyết
Thực thi quyết định Option B từ phiên Clarify: 2 nút nổi độc lập xếp chồng dọc ở góc dưới bên phải màn hình.

### Quyết định kỹ thuật (Decision)
- Tạo component `FloatingChatsComponent` gói cả 2 widget:
  - Nút trên: `LiveSupportFloatingBtn` (Màu xanh đậm `#1e40af`, icon `fa-headset`, tooltip *"Nhân viên tư vấn Acme"*).
  - Nút dưới: `AiAssistantFloatingBtn` (Màu tím gradient `#4f46e5`, icon `fa-robot`, tooltip *"Trợ lý ảo AI Gemini"*).
- Vị trí: `position: fixed; right: 24px; bottom: 24px; display: flex; flex-direction: column; gap: 12px; z-index: 1050;`.
- Khi bấm nút nào, cửa sổ chat của dịch vụ đó sẽ bung lên ngay phía trên nút bấm; tự động đóng widget còn lại để tránh chật màn hình.

---

## 5. Phân Trang & Điều Hướng Danh Mục Sách (`/books`)

### Vấn đề cần giải quyết
Thực thi quyết định Option A từ phiên Clarify: Numbered Pagination (1, 2, 3... Trang cuối) đồng bộ query param URL (`?page=1&pageSize=12`).

### Quyết định kỹ thuật (Decision)
- `BookCatalogComponent`:
  - Lắng nghe `ActivatedRoute.queryParams` để đọc `page`, `pageSize`, `filter`, `categoryId`, `priceRange`.
  - Gọi API `BookService.getList({ skipCount: (page - 1) * pageSize, maxResultCount: pageSize, filter: ... })`.
  - Phân trang: Hiển thị thanh nút `[Trước] 1 2 3 ... [Sau]`, khi chuyển trang thực hiện `router.navigate([], { queryParams: { page: newPage }, queryParamsHandling: 'merge' })` và gọi `window.scrollTo({ top: 0, behavior: 'smooth' })`.
