# Implementation Plan: User-Facing UI/UX Modernization & Redesign (009-user-ui-refactor)

**Branch**: `refactorUI` | **Date**: 2026-10-02 | **Spec**: [specs/009-user-ui-refactor/spec.md](./spec.md)  
**Input**: Feature specification from `specs/009-user-ui-refactor/spec.md`

---

## Summary

Hiện đại hóa và tái thiết kế toàn diện giao diện khách hàng (**User-facing Storefront**) cho hệ thống `Acme.BookStore` theo phong cách **Modern Digital Bookstore & Online Library**. Dự án áp dụng bộ nhận diện màu Xanh dương (`#1e40af`) + Trắng (`#ffffff`) kết hợp Chế độ Tối (Dark Navy `#0b1329`), xây dựng hệ thống 14 Reusable Angular Components độc lập, cơ chế phản hồi tương tác bằng Toast (loại bỏ hoàn toàn `alert`), luồng thanh toán chuyên biệt `/checkout`, phân trang số cho danh mục sách và cụm 2 nút chat nổi xếp chồng dọc (Live Support & AI Gemini), đảm bảo tách biệt tuyệt đối khỏi giao diện Quản trị Admin (LeptonX).

---

## Technical Context

**Language/Version**: TypeScript 5.4+, HTML5, SCSS, C# (.NET 9.0)  
**Primary Dependencies**: Angular 18+ (Standalone Components, Angular Signals), `@abp/ng.core`, `@abp/ng.theme.shared`, FontAwesome / Bootstrap Icons, RxJS (chuyển đổi qua `firstValueFrom`)  
**Storage**: `localStorage` (lưu trữ `bookstore_theme`), SQL Server Backend qua ABP Application Services hiện hữu  
**Testing**: Jasmine / Karma (`npm test`), manual E2E validation scenarios trên trình duyệt  
**Target Platform**: Web Browsers (Chrome, Edge, Firefox, Safari) trên Desktop, Tablet và Mobile (Responsive tối thiểu 360px)  
**Project Type**: Fullstack Web Application (Angular SPA Frontend + ASP.NET Core ABP Backend)  
**Performance Goals**: Tải trang dưới 1.5s, chuyển đổi theme dưới 5ms, phản hồi bộ lọc và cập nhật Signal Store dưới 50ms, đạt 60fps khi scroll/animation  
**Constraints**:
1. Tuyệt đối không can thiệp, không sửa đổi và không làm vỡ giao diện Quản trị Admin (`/admin/*`, `/dashboard`).
2. Scoped CSS / Design Tokens riêng cho Storefront.
3. Không sử dụng `alert()` hay Bootstrap JS modal; sử dụng 100% Signal-based Toast và Custom Modal.
4. Tuân thủ 100% chuẩn ngôn ngữ và tiền tệ Tiếng Việt (`₫` / `VNĐ`).  
**Scale/Scope**: 10 trang khách hàng (Home, Books Catalog, Book Detail, Cart, Checkout, Wishlist, My Orders, Notifications, About Us, Contact), 14 Reusable UI Components, 2 Floating Action Chat Buttons.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Điều khoản Hiến pháp | Tiêu chí Kiểm định | Trạng Thái Đánh Giá |
| :--- | :--- | :---: |
| **I. Direct IApplicationService** | Tái sử dụng các Application Services hiện hữu từ Spec 001 - 008, không can thiệp sai lệch contract `Application.Contracts`. | **PASS** |
| **II. Angular Signals & One-Way** | Toàn bộ UI State (Cart count, Notifications, Filters, Modal, Theme, Toast) quản lý bằng `signal()`, `computed()`. Không dùng two-way phức tạp. | **PASS** |
| **III. Modern Angular Standards** | 100% components là Standalone, sử dụng `inject()`, modern control flow `@if`, `@for (track ...)`, `@switch`. | **PASS** |
| **IV. Clean Architecture (ABP)** | Phân tầng nghiêm ngặt: Tách biệt hoàn toàn tầng Presentation (Storefront UI) khỏi Domain và Backend Business Logic. | **PASS** |
| **V. Localization & Tiếng Việt** | Giao diện, thông báo Toast, nhãn nút và định dạng tiền tệ (`₫`) hiển thị 100% Tiếng Việt. | **PASS** |

---

## Project Structure

### Documentation (this feature)

```text
specs/009-user-ui-refactor/
├── spec.md                     # Feature specification (Đã clarify)
├── checklists/
│   └── requirements.md         # Quality checklist (16/16 pass)
├── plan.md                     # Bản kế hoạch kiến trúc tổng thể (File này)
├── research.md                 # Phase 0: Kiến trúc tokens, layout, state & decisions
├── data-model.md               # Phase 1: Models & UI State interfaces
├── contracts/
│   └── storefront-contracts.md # Phase 1: Component Input/Output & Route contracts
└── quickstart.md               # Phase 1: Hướng dẫn kịch bản chạy thử nghiệm & kiểm thử
```

### Source Code Architecture (repository layout)

```text
angular/src/
├── app/
│   ├── features/
│   │   ├── user/                               # Giao diện Khách hàng (Storefront)
│   │   │   ├── layout/                         # Storefront Layout tổng thể
│   │   │   │   ├── storefront-layout.component.ts
│   │   │   │   └── storefront-layout.component.html
│   │   │   ├── home/                           # Trang chủ (Hero slider, Featured, New Arrivals)
│   │   │   ├── catalog/                        # Danh mục sách (Sidebar lọc, phân trang số)
│   │   │   ├── book-detail/                    # Chi tiết sách (2 cột, tab thông tin, reviews)
│   │   │   ├── Carts/                          # Giỏ hàng & Cart Signal Store
│   │   │   ├── checkout/                       # Trang Thanh toán & Đặt hàng độc lập (Mới)
│   │   │   ├── Orders/                         # Đơn hàng của tôi, Order Timeline & VietQR
│   │   │   ├── Wishlists/                      # Danh sách yêu thích cá nhân
│   │   │   ├── Notifications/                  # Trung tâm thông báo
│   │   │   ├── about/                          # Giới thiệu câu chuyện thương hiệu
│   │   │   ├── contact/                        # Liên hệ & form hỗ trợ
│   │   │   ├── chat-support/                   # Floating Live Support Chat (Nhân viên)
│   │   │   └── chat-bot/                       # Floating AI Virtual Assistant (Gemini)
│   │   └── admin/                              # Giao diện Quản trị (KHÔNG THAY ĐỔI)
│   │       ├── Books/
│   │       ├── Authors/
│   │       ├── Categories/
│   │       ├── Publishers/
│   │       ├── Coupons/
│   │       ├── AdminOrders/
│   │       ├── AdminReviews/
│   │       └── Dashboard/
│   └── shared/
│       ├── components/storefront/              # 14 Reusable Storefront Components
│       │   ├── announcement-bar/
│       │   ├── user-header/
│       │   ├── user-footer/
│       │   ├── search-bar/
│       │   ├── book-card/
│       │   ├── category-card/
│       │   ├── star-rating/
│       │   ├── price-tag/
│       │   ├── quantity-selector/
│       │   ├── empty-state/
│       │   ├── loading-skeleton/
│       │   ├── order-status-badge/
│       │   ├── order-timeline/
│       │   └── toast-notification/
│       └── services/
│           ├── theme.service.ts                # Signal Store quản lý Dark/Light Theme
│           └── toast.service.ts                # Signal Store quản lý Toast Notifications
└── styles.scss                                 # Biến màu Design Tokens (Light & Dark Theme)
```

---

## Complexity Tracking

*Không phát sinh vi phạm Hiến pháp hoặc kiến trúc phức tạp không cần thiết.*

| Hạng mục | Quyết định | Lý do & Giải pháp tối ưu |
| :--- | :--- | :--- |
| **Theme System** | Pure CSS Variables + Signal ThemeService | Không thêm thư viện ngoài; chuyển theme dưới 5ms, nhẹ và không xung đột với LeptonX. |
| **Notification System** | Custom Toast Notification Signal Component | Loại bỏ hoàn toàn `alert()`, hỗ trợ tự động đóng sau 3.5s, hiệu ứng mềm mại. |
| **Admin Isolation** | `StorefrontLayoutComponent` độc lập | Đảm bảo 100% route admin giữ nguyên vẹn LeptonX Dynamic Layout. |
