# Feature Specification: User-Facing UI/UX Modernization & Redesign (Thiết Kế Lại Giao Diện Người Dùng)

**Feature Branch**: `refactorUI`  
**Created**: 2026-10-02  
**Status**: Specified  
**Input**: User description: "Thiết kế lại toàn bộ giao diện khách hàng (User Storefront) của Acme.BookStore theo phong cách Thư viện Số hiện đại (Modern Digital Bookstore), tông màu Xanh dương + Trắng, tối ưu trải nghiệm đọc sách và mua sắm, tách biệt hoàn toàn khỏi Admin UI."

## Clarifications

### Session 2026-10-02
- Q: Hai widget chat nổi (Live Support và Trợ lý AI Gemini) nên được hiển thị và kích hoạt như thế nào ở góc màn hình để tối ưu trải nghiệm và không chiếm dụng diện tích hiển thị trên thiết bị di động? (FR-012) → A: B - Hai nút nổi độc lập xếp chồng dọc: Nút Live Support ở trên và nút AI Assistant ở dưới, luôn hiển thị đồng thời ở góc phải dưới màn hình với màu sắc và nhãn tooltip phân biệt rõ ràng.
- Q: Tính năng thêm sách vào Danh sách yêu thích (Wishlist) nên xử lý như thế nào khi khách truy cập chưa đăng nhập tài khoản? (FR-003) → A: C - Bắt buộc đăng nhập: Khi khách chưa đăng nhập bấm icon trái tim, hiển thị Toast thông báo "Vui lòng đăng nhập để lưu sách yêu thích" và điều hướng người dùng tới trang đăng nhập.
- Q: Khi khách hàng bấm "Tiến hành thanh toán" (Proceed to Checkout) từ trang Giỏ hàng, quy trình nhập thông tin giao hàng và xác nhận đơn nên diễn ra như thế nào? (FR-008) → A: A - Trang Đặt hàng riêng biệt (/checkout): Điều hướng sang trang checkout chuyên biệt có 2 cột (thông tin giao hàng bên trái, tóm tắt đơn hàng bên phải), tối ưu tỷ lệ chuyển đổi và tránh xao nhãng.
- Q: Cơ chế duyệt trang cho Danh mục Sách (/books) nên áp dụng theo hình thức nào để tối ưu cho việc tìm kiếm và lọc dữ liệu? (FR-005) → A: A - Phân trang số (Numbered Pagination): Hiển thị thanh phân trang đánh số (1, 2, 3... Trang cuối) và chọn số lượng mục hiển thị (12/24/48 sách/trang), đồng bộ URL query parameters (?page=1&pageSize=12).
- Q: Giao diện Thư viện Số mới có cần hỗ trợ nút chuyển đổi chế độ Tối (Dark Mode Toggle) trong phạm vi giai đoạn này không? (FR-001) → A: B - Hỗ trợ Nút chuyển đổi Dark Mode: Bổ sung nút chuyển đổi Sáng/Tối (icon Mặt trời/Mặt trăng) trên Header, lưu trạng thái vào LocalStorage và áp dụng bộ biến CSS màu tối (Dark Navy `#0b1329`) cho toàn bộ Storefront.

---

## 📌 1. Mục tiêu & Phạm vi Dự án (Goal & Scope)

### 1.1. Mục tiêu Cốt lõi
Thiết kế lại toàn bộ giao diện khách hàng (**User-facing Storefront**) của hệ thống `Acme.BookStore` theo phong cách hiện đại, tối giản, thanh lịch và chuyên nghiệp, tạo cảm giác như một **Modern Digital Bookstore & Online Library**:
- **Trải nghiệm đọc & mua sắm:** Ưu tiên khả năng duyệt sách, đọc mô tả và hình ảnh bìa sách chất lượng cao.
- **Điều hướng mượt mà:** Thanh điều hướng rõ ràng, thanh tìm kiếm dễ truy cập, responsive hoàn hảo trên Desktop, Tablet và Mobile.
- **Thao tác nhanh gọn:** Thêm vào giỏ hàng, thả tim yêu thích (Wishlist), áp dụng mã giảm giá và theo dõi đơn hàng trực quan, không dùng `alert()` mà dùng Toast & Inline feedback.
- **Thị giác thư giãn:** Giảm sự rối mắt, loại bỏ gradient quá mạnh, neon hoặc animation thừa, tối ưu cho việc đọc lâu không mỏi mắt.

### 1.2. Ranh giới Phạm vi (Strict Scope Rules)
- ✅ **DO (Được phép thực hiện):**
  - Tái thiết kế toàn bộ các trang dành cho Khách hàng: Home, Book Listing, Book Detail, Cart, Checkout (`/checkout`), Favorites (Wishlist), My Orders, Order Detail, Notifications, About Us, Contact.
  - Xây dựng hệ thống Reusable Components dùng chung cho giao diện User.
  - Cải tiến Header, Footer, Announcement Bar và 2 widget chat nổi (Live Support & AI Assistant).
- ❌ **DO NOT (Tuyệt đối KHÔNG thay đổi):**
  - **KHÔNG** đụng chạm hay thay đổi giao diện Quản trị (**Admin UI**).
  - **KHÔNG** sửa Admin Dashboard, Admin Menu Navigation, Admin Books/Authors/Coupons/Orders/Reviews management.
  - **KHÔNG** thay đổi Business Logic hiện tại của Backend, chỉ refactor tầng Presentation & UI/UX của User.

---

## 🎨 2. Design System & Bản sắc Thị giác (Visual Identity)

### 2.1. Hệ màu Chủ đạo (Primary Color Palette)
Hệ màu lấy cảm hứng từ thư viện số hiện đại: **Xanh dương (Blue) + Trắng (White)**.

| Thành phần | Mã màu gợi ý | Mục đích sử dụng |
| :--- | :--- | :--- |
| **Primary Blue** | `#1e40af` / `#2563eb` | Nút bấm chính (CTA), active state, link, icons chính |
| **Primary Hover** | `#1d4ed8` | Hiệu ứng hover cho nút bấm và liên kết |
| **Light Blue Tint**| `#eff6ff` / `#dbeafe` | Background card phụ, tag danh mục, highlight badge |
| **Background Main**| `#ffffff` | Nền trắng chính, tạo sự thông thoáng |
| **Background Soft**| `#f8fafc` / `#f1f5f9` | Nền các section xen kẽ, sidebar, input background |
| **Heading Text** | `#0f172a` (Dark Navy) | Tiêu đề H1-H4, tên sách, giá tiền chính |
| **Body / Secondary**| `#475569` / `#64748b` | Đoạn văn, mô tả sách, tên tác giả, ngày tháng |
| **Border & Divider**| `#e2e8f0` | Viền card, đường ngăn cách nhẹ nhàng |

### 2.2. Bảng Màu Chế Độ Tối (Dark Mode Palette)
Hỗ trợ chuyển đổi Sáng/Tối đồng bộ qua CSS Variables (`[data-theme="dark"]` hoặc `.dark`):
- **Dark Background Main**: `#0b1329` (Sâu thẳm, dịu mắt cho việc đọc ban đêm)
- **Dark Background Card/Surface**: `#111c44` / `#1e293b`
- **Dark Text Heading**: `#f8fafc` (Trắng bạc tương phản cao)
- **Dark Text Body**: `#94a3b8` / `#cbd5e1`
- **Dark Border**: `#1e293b` / `#334155`
- **Accent Blue (Dark Mode)**: `#3b82f6` / `#60a5fa`

### 2.3. Màu sắc Ngữ nghĩa (Semantic Colors)
Sử dụng tiết chế, không lạm dụng làm mất đi tông Blue-White:
- **Green (`#10b981`):** Thành công, Đơn hàng hoàn thành, Còn hàng (In stock).
- **Orange / Amber (`#f59e0b`):** Chờ xử lý (Pending), Đang giao hàng, Đánh giá sao.
- **Red (`#ef4444`):** Lỗi, Đơn hàng đã hủy, Hết hàng, Nút Xóa / Bỏ thích.

### 2.3. Quy chuẩn Thiết kế (Visual Style)
- **Border Radius:** Vừa phải (6px – 10px cho buttons & inputs, 12px – 16px cho cards & modal).
- **Box Shadow:** Đổ bóng cực nhẹ (`0 1px 3px rgba(0,0,0,0.05)`, hover: `0 10px 25px -5px rgba(37,99,235,0.08)`).
- **Typography:** Font chữ không chân thanh lịch (Inter / Outfit / Roboto), tương phản cao, dễ đọc.
- **Card Layout:** Thoáng đãng, có khoảng thở (white-space) hợp lý.

---

## 🧱 3. Kiến trúc Layout & Các Trang Giao diện Khách hàng

### 3.1. Thanh Thông Báo (Announcement Bar)
- Nằm phía trên cùng của Header.
- Banner mỏng hiển thị các thông báo quan trọng: khuyến mãi freeship, sự kiện sách mới ra mắt.
- Nền xanh nhạt hoặc xanh primary dịu mắt, có thể đóng (Close button).

### 3.2. Global Sticky Header
- **Logo:** Biểu tượng cuốn sách / thư viện tinh tế + chữ "Acme BookStore", click chuyển về trang Home.
- **Thanh tìm kiếm trung tâm (Search Bar):** Dễ thấy, placeholder `"Search books, authors, categories..."`, hỗ trợ tìm nhanh tức thì.
- **Menu điều hướng chính:** `Home`, `Books / Categories`, `About Us`, `Contact`.
- **User Actions Area:**
  - Nút **Chuyển đổi Chế độ Sáng / Tối (Theme Toggle)**: Icon Mặt trời/Mặt trăng chuyển đổi mượt mà giữa Light và Dark theme.
  - Nút **Yêu thích (Wishlist)** kèm badge số lượng.
  - Nút **Giỏ hàng (Cart)** kèm badge số lượng sản phẩm thời gian thực.
  - Nút **Thông báo (Notifications)** kèm chuông và chấm đỏ unread.
  - **Hồ sơ Người dùng (User Avatar/Name):** Dropdown menu gọn gàng: *My Profile, My Orders, Favorites, Notifications, Đăng xuất*.

### 3.3. Trang Chủ (Home Page)
1. **Hero Library Slider / Carousel:**
   - Slider hình ảnh chất lượng cao về không gian đọc sách ấm cúng, thư viện hiện đại.
   - Text overlay truyền cảm hứng đọc sách: *"Discover Your Next Great Read"*.
   - Nút kêu gọi hành động (CTA): `Explore Books`.
   - Hỗ trợ auto-play, nút chuyển slide trái/phải và chấm tròn phân trang.
2. **Featured Books (Sách nổi bật):** Băng chuyền / Grid các tác phẩm tuyển chọn.
3. **New Arrivals (Sách mới về):** Các đầu sách mới nhất cập nhật trong hệ thống.
4. **Popular & Best Sellers:** Sách được đặt mua nhiều nhất.
5. **Book Categories Cards:** Các thẻ danh mục trực quan có biểu tượng/hình ảnh minh họa.
6. **Promotional Banner Section:** Khối giới thiệu voucher khuyến mãi hoặc thông điệp văn hóa đọc.

### 3.4. Trang Danh Mục & Tìm Kiếm Sách (Book Listing & Catalog)
- **Cột Lọc bên trái (Left Filter Sidebar):**
  - Lọc theo Thể loại (Categories - checkbox / list).
  - Lọc theo Tác giả (Authors).
  - Lọc theo Khoảng giá (Price range slider hoặc các mức giá phổ biến).
  - Lọc theo Độ tuổi độc giả (`AgeLimit`: Thiếu nhi, Thiếu niên, Trưởng thành).
  - Lọc theo Tình trạng kho (Còn hàng / Tất cả).
- **Khu vực Nội dung chính (Main Grid):**
  - Thanh công cụ trên đầu: Hiển thị số lượng kết quả, ô sắp xếp (*Mới nhất, Giá tăng dần, Giá giảm dần, Bán chạy*).
  - Grid sách Responsive: 4-5 sách/hàng (Desktop), 3 sách/hàng (Tablet), 2 sách/hàng (Mobile).
  - Thanh phân trang số (Numbered Pagination): Các nút chuyển trang (Trước, 1, 2, 3... Sau) và dropdown chọn số lượng hiển thị (12, 24, 48 sách/trang), đồng bộ query param trên URL (`?page=1&pageSize=12`) và tự động cuộn nhẹ lên đầu danh sách khi chuyển trang.
- **Thẻ Sách Chuẩn hóa (`BookCardComponent`):**
  - Tỷ lệ ảnh bìa chuẩn (2:3 hoặc 3:4) có viền bo nhẹ, hiệu ứng zoom ảnh nhẹ khi hover.
  - Nút trái tim Yêu thích (Wishlist) nổi ở góc ảnh.
  - Huy hiệu giảm giá Flash Sale / Giới hạn độ tuổi.
  - Tên sách (tối đa 2 dòng, cắt đuôi bằng `...`), tên tác giả, xếp hạng sao trung bình.
  - Giá bán (nổi bật) và giá gốc gạch ngang (nếu có giảm giá).
  - Nút "Thêm vào giỏ" (Add to Cart) trực tiếp.

### 3.5. Trang Chi Tiết Sách (Book Detail Page)
- **Phía trên (Top Split Layout):**
  - **Bên trái:** Ảnh bìa lớn sắc nét, hỗ trợ thumbnail xem ảnh phụ (nếu có).
  - **Bên phải:** Tên sách trang trọng, tác giả, nhà xuất bản, thể loại, điểm đánh giá sao, bảng giá (kèm % giảm), tình trạng kho hàng, bộ chọn số lượng (+/-), nút **"Thêm vào giỏ"** và nút **"Mua ngay"**.
- **Phía dưới (Tab Content & Recommendations):**
  - Tab 1: Giới thiệu nội dung sách & trích dẫn.
  - Tab 2: Thông tin chi tiết xuất bản (Năm XB, Số trang, Ngôn ngữ, Độ tuổi).
  - Tab 3: Khu vực Đánh giá & Nhận xét của độc giả kèm form gửi đánh giá 1-5 sao.
  - Section cuối: Sách gợi ý cùng thể loại / cùng tác giả (*Related Books Carousel*).

### 3.6. Trang Giỏ Hàng (Shopping Cart Page)
- Bảng danh sách sản phẩm trong giỏ: Ảnh bìa, Tên sách, Đơn giá, Bộ điều chỉnh số lượng (+/-), Tổng tiền từng món, Nút xóa món.
- Empty State thân thiện khi giỏ trống: Minh họa giỏ hàng rỗng + Nút CTA *"Tiếp tục khám phá sách"*.
- Cột Tóm tắt Đơn hàng (Order Summary Sidebar):
  - Tạm tính (Subtotal).
  - Khung nhập Mã giảm giá (Coupon Code) kèm nút Áp dụng và hiển thị số tiền được chiết khấu.
  - Phí vận chuyển ước tính.
  - Tổng thanh toán cuối cùng (Grand Total).
  - Nút lớn: *"Tiến hành thanh toán" (Proceed to Checkout)* điều hướng sang trang `/checkout`.

### 3.6.1. Trang Thanh Toán & Đặt Hàng Chuyên Biệt (Checkout Page - `/checkout`)
- Bố cục 2 cột tiêu chuẩn:
  - **Cột trái (Thông tin Nhận hàng & Thanh toán):** Form nhập họ tên người nhận, số điện thoại, địa chỉ nhận hàng, ghi chú đơn hàng; lựa chọn phương thức thanh toán (Tiền mặt khi nhận hàng COD hoặc Chuyển khoản VietQR).
  - **Cột phải (Tóm tắt Đơn hàng Sticky):** Danh sách các món sách tóm tắt (ảnh, tên, số lượng, giá), tổng tiền hàng, phí ship, chiết khấu voucher và nút *"Xác nhận Đặt hàng"*.
- Sau khi bấm xác nhận đặt hàng thành công, tự động chuyển hướng sang trang Chi tiết Đơn hàng hoặc hiển thị popup mã VietQR thanh toán.

### 3.7. Trang Đơn Hàng của Tôi (My Orders) & Chi Tiết Đơn Hàng
- Danh sách đơn hàng dạng thẻ/bảng responsive, lọc theo trạng thái: *Tất cả, Đang xử lý, Đang giao, Hoàn thành, Đã hủy*.
- Huy hiệu trạng thái màu sắc chuẩn mực (`Placed`, `Processing`, `Shipped`, `Completed`, `Cancelled`).
- Sơ đồ tiến trình đơn hàng trực quan (Order Timeline): `Đặt hàng` ➔ `Xác nhận` ➔ `Đang giao` ➔ `Hoàn thành`.
- Popup / Trang chi tiết hiển thị mã VietQR thanh toán tự động, thông tin người nhận hàng, địa chỉ và nút "Hủy đơn" (nếu còn trong thời gian cho phép).

### 3.8. Trang Danh Sách Yêu Thích (Favorites / Wishlist)
- Yêu cầu xác thực tài khoản: Bắt buộc đăng nhập để sử dụng. Khi khách vãng lai (chưa đăng nhập) bấm icon trái tim yêu thích, hệ thống hiển thị Toast thông báo *"Vui lòng đăng nhập để lưu sách yêu thích"* và điều hướng đến trang Đăng nhập.
- Grid hiển thị các cuốn sách đã lưu của tài khoản.
- Thao tác nhanh: Chuyển thẳng sách vào giỏ hàng hoặc bỏ khỏi danh sách yêu thích.
- Empty State: Gợi ý các danh mục sách hot khi chưa có sách yêu thích nào.

### 3.9. Trang Thông Báo (Notifications Page)
- Danh sách thông báo chia theo loại: Cập nhật đơn hàng, Khuyến mãi mới, Tin tức hệ thống.
- Highlight nhẹ các thông báo chưa đọc, hỗ trợ nút "Đánh dấu tất cả đã đọc".

### 3.10. Hai Hộp Chat Tiện Ích Tách Biệt (Floating Chat Widgets)
Bố trí 2 nút nổi tròn độc lập xếp chồng theo chiều dọc ở góc dưới bên phải màn hình:
1. **💬 Live Support Chat (Hỗ trợ Khách hàng từ Nhân viên - Nút phía trên):**
   - Icon tai nghe / tin nhắn màu xanh dương đậm (`#1e40af`) kèm tooltip *"Nhân viên tư vấn Acme BookStore"*.
   - Khách trò chuyện trực tiếp với Admin qua SignalR real-time.
2. **🤖 AI Book Assistant (Trợ lý Ảo AI Gemini - Nút phía dưới):**
   - Icon robot màu tím gradient / xanh ngọc (`#4f46e5` / `#06b6d4`) kèm tooltip *"Trợ lý ảo AI Gemini"*.
   - Lời chào: *"Xin chào! Tôi là Trợ lý AI của BookStore. Bạn cần tìm cuốn sách gì hôm nay?"*.
   - Giao diện có thẻ sách gợi ý có thể bấm mua ngay trong khung chat.
   - **Quy tắc:** Hai nút luôn hiển thị đồng thời, xếp chồng dọc cách nhau 12px, mở đúng cửa sổ tương ứng khi người dùng tương tác.

### 3.11. Trang Giới Thiệu (About Us) & Liên Hệ (Contact)
- **About Us:** Kể câu chuyện hình thành Book Store (Storytelling), sứ mệnh mang tri thức đến mọi nhà, hình ảnh không gian thư viện và cam kết chất lượng sách thật 100%.
- **Contact:** Thông tin địa chỉ, hotline, email, giờ mở cửa kèm Form gửi tin nhắn hỗ trợ trực quan.

### 3.12. Global Footer Thống Nhất
- Chia 4 cột cân đối:
  - Cột 1: Thông tin thương hiệu Acme BookStore, sứ mệnh, mạng xã hội.
  - Cột 2: Khám phá sách (Thể loại, Sách bán chạy, Khuyến mãi).
  - Cột 3: Hỗ trợ khách hàng (Chính sách đổi trả, Hướng dẫn mua hàng, Vận chuyển, FAQ).
  - Cột 4: Đăng ký nhận tin & Phương thức thanh toán (VietQR, Tiền mặt).
- Dòng bản quyền: `© 2026 Acme BookStore. All rights reserved.`

---

## 🧩 4. Danh Mục Component Tái Sử Dụng (Reusable Component Library)

Hệ thống xây dựng 14 UI component độc lập (Standalone & Scoped CSS):
1. `AnnouncementBarComponent` - Banner thông báo đầu trang có thể đóng mở.
2. `UserHeaderComponent` - Header sticky gồm logo, tìm kiếm, navigation và menu cá nhân.
3. `UserFooterComponent` - Footer 4 cột thông tin thương hiệu, chính sách và liên kết.
4. `SearchBarComponent` - Ô tìm kiếm tương tác nhanh.
5. `BookCardComponent` - Thẻ hiển thị sách đồng bộ (ảnh bìa, giá, rating, CTA).
6. `CategoryCardComponent` - Thẻ danh mục sách trực quan.
7. `StarRatingComponent` - Hiển thị và chọn số sao đánh giá (1-5 sao).
8. `PriceTagComponent` - Định dạng giá tiền VND kèm % giảm giá.
9. `QuantitySelectorComponent` - Bộ tăng/giảm số lượng sản phẩm.
10. `EmptyStateComponent` - Trạng thái trống cho giỏ hàng, danh sách yêu thích, thông báo.
11. `LoadingSkeletonComponent` - Khung xương chờ tải dữ liệu hiệu ứng shimmer.
12. `OrderStatusBadgeComponent` - Huy hiệu trạng thái đơn hàng theo màu ngữ nghĩa.
13. `OrderTimelineComponent` - Thanh tiến trình vòng đời đơn hàng.
14. `ToastNotificationComponent` - Hộp thông báo nổi nhẹ nhàng thay thế alert().

---

## 🧪 5. User Scenarios & Acceptance Criteria *(mandatory)*

### User Story 1 - Khám phá và duyệt sách trực quan trên Trang chủ & Danh mục (Priority: P1)

Người mua sách muốn vào trang chủ và danh mục sách để tìm kiếm sách nhanh chóng theo thể loại, tác giả, giá tiền trong một giao diện thư viện số thanh lịch, thoáng đãng và dễ đọc.

**Why this priority**: Đây là điểm chạm đầu tiên và cốt lõi nhất của khách hàng khi truy cập Bookstore; quyết định khả năng chuyển đổi mua hàng và giữ chân người dùng.

**Independent Test**: Truy cập `/` và `/books`, thử nghiệm tìm kiếm từ khóa "Harry Potter", áp dụng bộ lọc thể loại và giá tiền; toàn bộ giao diện phải hiển thị mượt mà trên cả desktop và mobile mà không phụ thuộc vào các tính năng checkout nâng cao.

**Acceptance Scenarios**:
1. **Given** Khách hàng truy cập trang chủ `Acme.BookStore`, **When** trang tải xong, **Then** Header sticky, banner thông báo và Hero slider hiển thị đúng chuẩn bảng màu Xanh - Trắng, các khối "Featured Books", "New Arrivals" hiển thị thẻ sách với tỷ lệ chuẩn, ảnh không bị méo.
2. **Given** Khách hàng ở trang danh mục `/books`, **When** chọn lọc thể loại "Kỳ ảo" và kéo thanh giá dưới 200,000₫, **Then** danh sách sách cập nhật theo thời gian thực, có hiệu ứng Skeleton loading trong lúc tải dữ liệu, không có giật lag hay trắng màn hình.

---

### User Story 2 - Thao tác Giỏ hàng & Áp dụng Mã giảm giá với Phản hồi Toast (Priority: P1)

Khách hàng muốn thêm sách vào giỏ hàng từ bất kỳ đâu (Home, Catalog, Detail), điều chỉnh số lượng, nhập mã giảm giá và xem ngay kết quả chiết khấu bằng thông báo Toast mềm mại mà không bao giờ gặp popup chặn trình duyệt (`alert`).

**Why this priority**: Giỏ hàng và quy trình đặt hàng là dòng chảy doanh thu của hệ thống; trải nghiệm mượt mà không lỗi là bắt buộc.

**Independent Test**: Thêm 2 cuốn sách vào giỏ, mở trang giỏ hàng `/cart`, tăng/giảm số lượng, nhập mã giảm giá mẫu (ví dụ: `GIAM20K`), kiểm tra tổng tiền tự động tính lại và thông báo toast xuất hiện góc màn hình.

**Acceptance Scenarios**:
1. **Given** Khách hàng bấm nút "Thêm vào giỏ" trên thẻ sách, **When** hệ thống lưu sản phẩm vào giỏ, **Then** badge số lượng trên Header cập nhật tức thì, một thông báo Toast dạng popup mềm mại xuất hiện ở góc màn hình báo *"Đã thêm sách vào giỏ hàng thành công!"*, tuyệt đối không xuất hiện hộp thoại `alert()` của trình duyệt.
2. **Given** Khách hàng ở trang giỏ hàng, **When** thay đổi số lượng một cuốn sách hoặc xóa món, **Then** cột Tóm tắt Đơn hàng (Subtotal, Phí ship, Tổng thanh toán) lập tức tính toán lại mà không cần tải lại trang.

---

### User Story 3 - Theo dõi Tiến trình Đơn hàng & Thanh toán VietQR (Priority: P2)

Khách hàng muốn theo dõi danh sách đơn hàng đã mua, xem dòng thời gian trạng thái (Placed ➔ Processing ➔ Shipped ➔ Completed) và quét mã VietQR để thanh toán nhanh chóng.

**Why this priority**: Giúp khách hàng yên tâm về đơn hàng đã đặt, giảm thiểu khiếu nại và tự động hóa khâu xác nhận thanh toán.

**Independent Test**: Đăng nhập tài khoản, mở `/my-orders`, xem thẻ trạng thái đơn hàng, mở chi tiết một đơn hàng để kiểm tra sơ đồ Order Timeline và mã VietQR động.

**Acceptance Scenarios**:
1. **Given** Khách hàng truy cập `/my-orders`, **When** chọn tab lọc "Đang xử lý", **Then** hệ thống chỉ hiển thị các đơn hàng tương ứng kèm huy hiệu màu cam và mã đơn hàng rõ ràng.
2. **Given** Khách hàng bấm vào chi tiết một đơn hàng đang chờ thanh toán, **When** trang/popup chi tiết mở ra, **Then** sơ đồ tiến trình hiển thị rõ bước hiện tại, mã QR VietQR hiển thị chính xác số tiền và cú pháp chuyển khoản.

---

### User Story 4 - Tương tác Hỗ trợ qua 2 Hộp Chat Tách biệt (Priority: P3)

Khách hàng muốn phân biệt rõ ràng giữa kênh tư vấn trực tiếp từ nhân viên (Live Support) và Trợ lý ảo AI thông minh (AI Gemini Assistant) để nhận hỗ trợ phù hợp mà không bị nhầm lẫn.

**Why this priority**: Nâng cao trải nghiệm chăm sóc khách hàng và cung cấp gợi ý sách thông minh 24/7.

**Independent Test**: Bấm vào widget icon tai nghe xanh để mở Live Support Chat (kết nối nhân viên); bấm vào widget icon robot để mở AI Chatbot; xác minh 2 giao diện có visual header và phong cách chào hỏi riêng biệt.

**Acceptance Scenarios**:
1. **Given** Khách hàng cần hỗ trợ, **When** mở hộp chat Live Support, **Then** tiêu đề hiển thị *"Nhân viên tư vấn Acme BookStore"* với trạng thái trực tuyến.
2. **Given** Khách hàng mở AI Assistant, **When** gửi câu hỏi hỏi tìm sách, **Then** robot trả lời gợi ý sách có kèm thẻ sách bấm xem/mua ngay trực tiếp trong khung chat.

---

### Edge Cases
- **Mất kết nối mạng / Lỗi API Backend**: Hiển thị trạng thái Empty State thông báo "Không thể kết nối máy chủ, vui lòng thử lại sau" kèm nút Thử lại (Retry), không làm crash trang.
- **Giỏ hàng rỗng**: Hiển thị minh họa đồ họa giỏ hàng rỗng + nút bấm điều hướng đưa người dùng quay lại trang khám phá sách.
- **Dữ liệu sách thiếu ảnh bìa**: Tự động fallback về ảnh placeholder chuẩn sách bìa vector phong cách tối giản màu xanh nhạt, không hiển thị biểu tượng ảnh vỡ.
- **Tên sách hoặc tác giả quá dài**: Tự động cắt ngắn bằng dấu chấm lửng (`...`) trên thẻ sách, hiển thị tooltip hoặc hiển thị đầy đủ trong trang chi tiết.
- **Độ phân giải màn hình siêu nhỏ (dưới 360px)**: Header tự động co thành menu drawer thu gọn (hamburger menu), các cột lọc danh mục chuyển thành modal trượt từ cạnh vào (bottom sheet / slide-over drawer).

---

## 📋 6. Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: Hệ thống PHẢI áp dụng nhất quán bảng màu Thư viện Số hiện đại (Primary Blue `#1e40af`/`#2563eb`, Nền trắng `#ffffff`/`#f8fafc`) cho toàn bộ Storefront.
- **FR-002**: Hệ thống PHẢI giữ nguyên 100% giao diện và quyền truy cập của Admin (`/admin/*`, `/dashboard`), không để scoped CSS của User ảnh hưởng đến LeptonX Admin.
- **FR-003**: Hệ thống PHẢI cung cấp Sticky Header hiển thị logo, ô tìm kiếm nhanh, menu điều hướng và huy hiệu số lượng giỏ hàng/yêu thích cập nhật thời gian thực qua Angular Signals.
- **FR-004**: Trang chủ PHẢI có Hero Slider tự động chuyển đổi các banner truyền cảm hứng đọc sách và các khu vực Sách nổi bật, Sách mới về, Danh mục tiêu biểu.
- **FR-005**: Trang Danh mục Sách PHẢI hỗ trợ bộ lọc đa tiêu chí (thể loại, tác giả, mức giá, độ tuổi, tồn kho), sắp xếp kết quả và phân trang dạng số (12/24/48 sách/trang) đồng bộ URL query params mà không cần tải lại toàn trang.
- **FR-006**: Thẻ sách (`BookCardComponent`) PHẢI chuẩn hóa hiển thị ảnh bìa, tên sách, tác giả, giá bán VND, % giảm giá, điểm sao và nút Thêm vào giỏ.
- **FR-007**: Trang Chi tiết Sách PHẢI trình bày bố cục 2 cột (ảnh lớn bên trái, thông tin mua hàng bên phải) kết hợp hệ thống tab thông tin xuất bản, đánh giá nhận xét và băng chuyền sách gợi ý.
- **FR-008**: Trang Giỏ hàng PHẢI cho phép cập nhật số lượng, xóa sản phẩm, áp dụng voucher khuyến mãi và tính toán lại tổng tiền tức thì; nút "Tiến hành thanh toán" điều hướng sang trang Checkout riêng biệt (`/checkout`) có bố cục 2 cột.
- **FR-009**: Trang Đơn hàng của tôi PHẢI hiển thị danh sách đơn hàng có bộ lọc trạng thái và sơ đồ tiến trình vòng đời (Order Timeline) 4 giai đoạn.
- **FR-010**: Hệ thống PHẢI thay thế 100% cửa sổ thông báo trình duyệt (`alert()`, `confirm()`) bằng `ToastNotificationComponent` mềm mại và hộp thoại xác nhận tuỳ biến.
- **FR-011**: Hệ thống PHẢI hiển thị `LoadingSkeletonComponent` (hiệu ứng shimmer) trong suốt quá trình tải dữ liệu từ API, tránh tình trạng màn hình trắng giật cục.
- **FR-012**: Hệ thống PHẢI bố trí 2 nút nổi độc lập xếp chồng dọc ở góc dưới bên phải (Live Support ở trên, AI Gemini ở dưới), phân biệt rõ ràng về mặt thị giác, màu sắc và tooltip.
- **FR-013**: Hệ thống PHẢI đảm bảo độ tương thích hoàn chỉnh trên mọi thiết bị (Responsive: Mobile < 768px, Tablet 768-1024px, Desktop > 1024px).
- **FR-014**: Tất cả chuỗi văn bản, thông báo lỗi, nhãn nút và định dạng tiền tệ PHẢI tuân thủ chuẩn Tiếng Việt (VNĐ / `₫`).
- **FR-015**: Trạng thái giao diện và dữ liệu Storefront PHẢI được quản lý theo kiến trúc Signal-First của Angular (`signal()`, `computed()`) tuân thủ Hiến pháp Acme.BookStore.
- **FR-016**: Hệ thống PHẢI yêu cầu người dùng đăng nhập tài khoản khi sử dụng tính năng Danh sách yêu thích (Wishlist); nếu chưa đăng nhập, hiển thị thông báo Toast hướng dẫn đăng nhập và điều hướng người dùng.
- **FR-017**: Hệ thống PHẢI cung cấp nút chuyển đổi Chế độ Sáng / Tối (Dark Mode Toggle) trên Header, lưu tùy chọn vào LocalStorage và áp dụng bảng màu Dark Navy không gây lóa mắt.

### Key Entities
- **Storefront Book**: Thực thể biểu diễn sách trên giao diện người dùng gồm mã ID, tên sách, ảnh bìa, tác giả, thể loại, giá niêm yết, giá giảm, đánh giá sao, tồn kho và nhãn giới hạn độ tuổi.
- **Cart Item**: Thực thể món hàng trong giỏ gồm mã sách, thông tin sách tóm tắt, đơn giá, số lượng chọn mua và thành tiền.
- **Order Tracking**: Thực thể đơn hàng gồm mã đơn, ngày đặt, danh sách món, tổng thanh toán, mã VietQR và trạng thái vòng đời (`Placed`, `Processing`, `Shipped`, `Completed`, `Cancelled`).
- **Applied Coupon**: Thực thể mã khuyến mãi gồm mã voucher, tỷ lệ/số tiền giảm, số tiền được khấu trừ và điều kiện áp dụng.
- **Notification Item**: Thực thể thông báo gồm ID, tiêu đề, nội dung tóm tắt, thời gian tạo, phân loại và trạng thái đã đọc/chưa đọc.

---

## 🎯 7. Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: 100% các trang Storefront Khách hàng (Home, Catalog, Detail, Cart, Orders, Wishlist, Notifications) được chuyển đổi sang phong cách Thư viện Số Xanh - Trắng đồng bộ.
- **SC-002**: 0% xung đột CSS với giao diện Quản trị Admin (giao diện LeptonX Admin giữ nguyên vẹn 100% khi truy cập các route quản lý).
- **SC-003**: 100% các thông báo thao tác (Thêm giỏ hàng, xóa món, lưu yêu thích) sử dụng Toast Notification mềm mại; không còn bất kỳ lệnh `alert()` hoặc `confirm()` gốc nào của trình duyệt.
- **SC-004**: Thời gian phản hồi bộ lọc sách và tìm kiếm trên giao diện đạt dưới 100ms đối với thao tác người dùng trên bộ nhớ tạm / signal state.
- **SC-005**: 100% các thành phần giao diện đạt chuẩn hiển thị Responsive không bị vỡ bố cục trên màn hình di động (chiều rộng tối thiểu 360px).
- **SC-006**: Đạt 100% tuân thủ các quy tắc trong Hiến pháp Acme.BookStore (Signal-First, Standalone Components, Modern Control Flow `@if`/`@for`).

---

## 💡 8. Assumptions & Dependencies

- **Tái sử dụng Backend APIs hiện hữu**: Toàn bộ nghiệp vụ Sách, Giỏ hàng, Đơn hàng, Voucher, Đánh giá và Chatbot đã được xây dựng và kiểm thử hoàn chỉnh ở các Spec 001 - 008, chỉ kết nối hiển thị qua Angular Services/Proxy.
- **Không thay đổi cơ sở dữ liệu**: Không tạo mới thêm bảng hay EF Core migration ở Backend trừ khi cần bổ sung trường dữ liệu hiển thị thuần túy cho UI.
- **Môi trường chạy**: Ứng dụng chạy trên Angular 18+ với kiến trúc Standalone Components và SCSS tokens.
- **Font chữ & Tài nguyên**: Sử dụng Google Fonts (Inter / Outfit / Roboto) và bộ icon tiêu chuẩn (FontAwesome / Bootstrap Icons) sẵn có trong dự án.

---

## ⚖️ 9. Hiến Pháp & Quy Chuẩn Kiến Trúc (Constitution Compliance Matrix)

| Điều khoản Hiến pháp | Tiêu chí Kiểm định | Đánh giá Tuân thủ trong Spec |
| :--- | :--- | :---: |
| **I. Direct IApplicationService** | Giữ nguyên các Application Services hiện hữu, không can thiệp sai lệch contract. | ✅ Tuân thủ |
| **II. Angular Signals & One-Way** | Toàn bộ UI State (cart count, filters, modal, toast) quản lý bằng `signal()`, `computed()`. | ✅ Tuân thủ |
| **III. Modern Angular Standards** | 14 components mới đều là Standalone, sử dụng `@if`, `@for (track ...)`, `inject()`. | ✅ Tuân thủ |
| **IV. Clean Architecture (ABP)** | Tách biệt Presentation và Application logic, không rò rỉ logic nghiệp vụ vào UI. | ✅ Tuân thủ |
| **V. Localization & Tiếng Việt** | Giao diện, thông báo Toast, đơn vị tiền tệ (`₫`) hiển thị 100% Tiếng Việt chuẩn mực. | ✅ Tuân thủ |
