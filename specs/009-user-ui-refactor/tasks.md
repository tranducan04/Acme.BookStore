# Tasks: User-Facing UI/UX Modernization & Redesign (009-user-ui-refactor)

**Branch**: `refactorUI` | **Spec**: [specs/009-user-ui-refactor/spec.md](./spec.md) | **Plan**: [specs/009-user-ui-refactor/plan.md](./plan.md)  
**Total Tasks**: 38 | **MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1)

---

## Phase 1: Setup (Design Tokens & Shared Core Infrastructure)

**Purpose**: Thiết lập hệ thống biến màu CSS (Design Tokens cho Light & Dark Theme) và các Services chia sẻ dùng Angular Signals.

- [X] T001 Configure Design Tokens (CSS Variables for Light & Dark Mode) in angular/src/styles.scss
- [X] T002 [P] Implement ThemeService with Angular Signals in angular/src/app/shared/services/theme.service.ts
- [X] T003 [P] Implement ToastService with Angular Signals in angular/src/app/shared/services/toast.service.ts
- [X] T004 [P] Create Storefront Shared Models and UI Interfaces in angular/src/app/shared/models/storefront.models.ts

---

## Phase 2: Foundational (Layout & Reusable Core UI Components)

**Purpose**: Xây dựng bộ khung Layout độc lập cho Storefront và các Reusable UI Components nền tảng.

**⚠️ CRITICAL**: Phải hoàn thành giai đoạn này trước khi triển khai các User Story để đảm bảo tính nhất quán và cô lập hoàn toàn khỏi Admin UI.

- [X] T005 [P] Implement ToastNotificationComponent in angular/src/app/shared/components/storefront/toast-notification/toast-notification.component.ts
- [X] T006 [P] Implement LoadingSkeletonComponent (shimmer effect) in angular/src/app/shared/components/storefront/loading-skeleton/loading-skeleton.component.ts
- [X] T007 [P] Implement PriceTagComponent (VND formatting with badge) in angular/src/app/shared/components/storefront/price-tag/price-tag.component.ts
- [X] T008 [P] Implement StarRatingComponent (1-5 stars interactive & readonly) in angular/src/app/shared/components/storefront/star-rating/star-rating.component.ts
- [X] T009 [P] Implement EmptyStateComponent with action buttons in angular/src/app/shared/components/storefront/empty-state/empty-state.component.ts
- [X] T010 [P] Implement QuantitySelectorComponent (+/- buttons with min/max) in angular/src/app/shared/components/storefront/quantity-selector/quantity-selector.component.ts
- [X] T011 [P] Implement OrderStatusBadgeComponent with semantic colors in angular/src/app/shared/components/storefront/order-status-badge/order-status-badge.component.ts
- [X] T012 [P] Implement OrderTimelineComponent (4-stage lifecycle) in angular/src/app/shared/components/storefront/order-timeline/order-timeline.component.ts
- [X] T013 [P] Implement AnnouncementBarComponent (dismissible banner) in angular/src/app/shared/components/storefront/announcement-bar/announcement-bar.component.ts
- [X] T014 [P] Implement UserHeaderComponent (sticky header, search, badges, theme toggle) in angular/src/app/shared/components/storefront/user-header/user-header.component.ts
- [X] T015 [P] Implement UserFooterComponent (4-column digital bookstore footer) in angular/src/app/shared/components/storefront/user-footer/user-footer.component.ts
- [X] T016 Implement StorefrontLayoutComponent wrapping user header, footer, toast container, and router outlet in angular/src/app/features/user/layout/storefront-layout.component.ts
- [X] T017 Configure Storefront routes to use StorefrontLayoutComponent in angular/src/app/app.routes.ts

**Checkpoint**: Nền tảng Storefront Layout và Reusable Components đã hoàn tất — các User Story có thể bắt đầu triển khai song song.

---

## Phase 3: User Story 1 - Khám phá và duyệt sách trực quan trên Trang chủ & Danh mục (Priority: P1) 🌟 MVP

**Goal**: Khách hàng có thể trải nghiệm trang chủ thư viện số hiện đại, tìm kiếm sách, lọc danh mục đa tiêu chí, phân trang số và xem chi tiết cuốn sách.

**Independent Test**: Truy cập `/` và `/books`, thử nghiệm tìm kiếm từ khóa, chọn lọc thể loại, phân trang số trang và mở xem chi tiết cuốn sách với layout 2 cột.

- [X] T018 [P] [US1] Implement BookCardComponent (cover image, title, author, rating, price, CTA) in angular/src/app/shared/components/storefront/book-card/book-card.component.ts
- [X] T019 [P] [US1] Implement CategoryCardComponent (icon, category name, book count) in angular/src/app/shared/components/storefront/category-card/category-card.component.ts
- [X] T020 [P] [US1] Implement SearchBarComponent with quick debounce in angular/src/app/shared/components/storefront/search-bar/search-bar.component.ts
- [X] T021 [US1] Redesign HomeComponent with Hero Library carousel, Featured Books, New Arrivals in angular/src/app/features/user/home/home.component.ts
- [X] T022 [US1] Implement BookCatalogComponent with left filter sidebar, numbered pagination, responsive book grid in angular/src/app/features/user/catalog/book-catalog.component.ts
- [X] T023 [US1] Implement BookDetailComponent with 2-column layout, metadata tabs, reader reviews, related books carousel in angular/src/app/features/user/book-detail/book-detail.component.ts
- [X] T024 [US1] Refactor WishlistComponent with login authentication check and empty state in angular/src/app/features/user/Wishlists/wishlist.component.ts

**Checkpoint**: User Story 1 hoàn thành độc lập và cung cấp MVP Storefront cốt lõi.

---

## Phase 4: User Story 2 - Thao tác Giỏ hàng & Áp dụng Mã giảm giá với Phản hồi Toast (Priority: P1)

**Goal**: Khách hàng có thể thêm sách vào giỏ hàng, cập nhật số lượng, áp dụng mã voucher và thực hiện đặt hàng tại trang checkout độc lập.

**Independent Test**: Thêm 2 cuốn sách vào giỏ từ thẻ sách (xác nhận Toast hiển thị và badge giỏ hàng tăng), mở `/cart` sửa số lượng, nhập mã voucher và chuyển sang `/checkout` hoàn tất đơn hàng.

- [X] T025 [US2] Update CartSignalStore to trigger ToastService notifications on add/remove in angular/src/app/features/user/Carts/cart-signal.store.ts
- [X] T026 [US2] Redesign CartComponent with product table, quantity adjuster, coupon form, and order summary sidebar in angular/src/app/features/user/Carts/cart.component.ts
- [X] T027 [US2] Implement dedicated CheckoutComponent with 2-column layout (receiver form, COD/VietQR toggle, sticky summary) in angular/src/app/features/user/checkout/checkout.component.ts
- [X] T028 [US2] Register /checkout route with auth guard and order placement redirect in angular/src/app/app.routes.ts

**Checkpoint**: User Story 1 và User Story 2 hoạt động liên hoàn, tạo nên chu kỳ mua sắm hoàn chỉnh.

---

## Phase 5: User Story 3 - Theo dõi Tiến trình Đơn hàng & Thanh toán VietQR (Priority: P2)

**Goal**: Khách hàng xem lịch sử đơn hàng, sơ đồ tiến trình 4 bước và thanh toán chuyển khoản qua mã VietQR động.

**Independent Test**: Mở `/my-orders`, lọc đơn theo tab "Đang xử lý", xem Order Timeline và mở chi tiết đơn hàng để quét mã VietQR tự động.

- [X] T029 [US3] Redesign OrderComponent with status tabs, order cards, order timeline, and VietQR payment modal in angular/src/app/features/user/Orders/order.component.ts
- [X] T030 [US3] Redesign NotificationComponent with category badges, unread highlight, and mark-all-read action in angular/src/app/features/user/Notifications/notification.component.ts

**Checkpoint**: Khách hàng có thể theo dõi trọn vẹn vòng đời đơn hàng và thông báo hệ thống.

---

## Phase 6: User Story 4 - Tương tác Hỗ trợ qua 2 Hộp Chat Tách biệt (Priority: P3)

**Goal**: Khách hàng có thể phân biệt và sử dụng hai kênh tư vấn độc lập qua 2 nút nổi xếp chồng dọc (Live Support & AI Gemini).

**Independent Test**: Nhấp nút Live Support màu xanh ở trên để trò chuyện với tư vấn viên; nhấp nút AI Assistant màu tím ở dưới để nhận tư vấn từ robot AI Gemini.

- [X] T031 [US4] Implement FloatingChatsComponent with vertical stacked buttons in angular/src/app/features/user/chat-support/floating-chats.component.ts
- [X] T032 [US4] Redesign CustomerChatComponent (Live Support) with advisor branding in angular/src/app/features/user/chat-support/customer-chat.component.ts
- [X] T033 [US4] Redesign ChatBotComponent (AI Virtual Assistant) with Gemini robot branding and book cards in angular/src/app/features/user/chat-bot/chat-bot.component.ts
- [X] T034 [US4] Integrate FloatingChatsComponent into StorefrontLayoutComponent in angular/src/app/features/user/layout/storefront-layout.component.ts

**Checkpoint**: Cả hai kênh hỗ trợ khách hàng hoạt động hài hòa và không xung đột vị trí.

---

## Phase 7: Polish & Static Pages & Cross-Cutting Concerns

**Purpose**: Tái thiết kế các trang tĩnh (About Us, Contact), kiểm thử cô lập Admin UI và kiểm tra toàn diện.

- [X] T035 [P] Redesign AboutComponent with bookstore story and library culture in angular/src/app/features/user/about/about.component.ts
- [X] T036 [P] Redesign ContactComponent with contact info cards and message form in angular/src/app/features/user/contact/contact.component.ts
- [X] T037 Verify Admin UI isolation ensuring LeptonX admin pages (/dashboard, /admin-orders, /authors) remain 100% unaffected in angular/src/styles.scss
- [X] T038 Execute quickstart verification scenarios per specs/009-user-ui-refactor/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Bắt đầu ngay lập tức, không phụ thuộc.
- **Foundational (Phase 2)**: Phụ thuộc vào Phase 1 (Setup) hoàn thành. Chặn toàn bộ các User Story.
- **User Story 1 (Phase 3 - MVP)**: Phụ thuộc vào Phase 2 (Foundational) hoàn thành.
- **User Story 2 (Phase 4)**: Phụ thuộc vào Phase 2 (Foundational); tích hợp cùng User Story 1.
- **User Story 3 (Phase 5)**: Phụ thuộc vào Phase 2 (Foundational); nhận dữ liệu từ các đơn hàng của US2.
- **User Story 4 (Phase 6)**: Phụ thuộc vào Phase 2 (Foundational).
- **Polish (Phase 7)**: Hoàn thiện sau khi các User Stories cơ bản đã sẵn sàng.

### Parallel Opportunities
- Các task có tiền tố `[P]` (T002, T003, T004 trong Phase 1; T005 - T015 trong Phase 2; T018, T019, T020 trong Phase 3) có thể triển khai song song do nằm trên các file component/service độc lập.
- Khi Phase 2 hoàn thành, User Story 1 (Duyệt sách) và User Story 4 (Chat nổi) có thể phát triển song song mà không xung đột file.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Hoàn thành Phase 1: Setup Tokens & Services (T001 - T004).
2. Hoàn thành Phase 2: Foundational Components & Layout (T005 - T017).
3. Hoàn thành Phase 3: User Story 1 (T018 - T024).
4. **Kiểm thử độc lập MVP**: Duyệt trang chủ, danh mục lọc sách và chi tiết sách trên trình duyệt.

### Incremental Delivery
1. Giao diện xem và duyệt sách (MVP: Phase 1 + 2 + 3).
2. Mua hàng & Checkout độc lập (Phase 4).
3. Quản lý đơn hàng & VietQR (Phase 5).
4. Hai widget chat nổi (Phase 6).
5. Hoàn thiện các trang tĩnh và nghiệm thu (Phase 7).
