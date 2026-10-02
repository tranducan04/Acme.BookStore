# Feature Specification: Shopping Cart & Order Processing (Giỏ Hàng & Xử Lý Đơn Hàng)

**Feature Branch**: `003-shopping-cart-orders`  
**Created**: 2026-09-29 | **Last Clarified**: 2026-09-29  
**Status**: Clarified & Implemented (Reverse Specification)  
**Tài liệu liên quan**:
- Entity Backend: 
  - Cart: `aspnet-core/src/Acme.BookStore.Domain/Carts/Cart.cs`, `CartItem.cs`
  - Order: `aspnet-core/src/Acme.BookStore.Domain/Order/Order.cs`, `OrderItem.cs`
- Contracts & DTOs: 
  - `aspnet-core/src/Acme.BookStore.Application.Contracts/Carts/`
  - `aspnet-core/src/Acme.BookStore.Application.Contracts/Orders/`
- Service Implementation: 
  - `aspnet-core/src/Acme.BookStore.Application/Carts/CartAppService.cs`
  - `aspnet-core/src/Acme.BookStore.Application/Orders/OrderAppService.cs`
- Giao diện Frontend:
  - User Cart & Checkout: `angular/src/app/features/user/Carts/`
  - User My Orders: `angular/src/app/features/user/Orders/`
  - Admin Order Management: `angular/src/app/features/admin/AdminOrders/`

---

## 📌 Tổng quan Nghiệp vụ (Business Overview)

Chức năng **Giỏ hàng & Đơn hàng (Shopping Cart & Orders)** là luồng thương mại điện tử cốt lõi chuyển đổi từ việc xem sách sang phát sinh doanh thu thực tế cho `Acme.BookStore`:
1. **Khách hàng (Customer):**
   - Quản lý giỏ hàng trực tuyến (thêm sách, tăng giảm số lượng, xóa sách, xem tổng tiền tức thì).
   - Tiến hành Đặt hàng (Checkout): Nhập thông tin người nhận, địa chỉ giao hàng, áp dụng Mã giảm giá (Coupon), chọn phương thức thanh toán (COD hoặc chuyển khoản VietQR).
   - Theo dõi lịch sử đơn hàng cá nhân, đổi phương thức thanh toán hoặc hủy đơn hàng khi chưa giao.
2. **Quản trị viên (Admin):**
   - Giám sát toàn bộ đơn hàng trong hệ thống theo thời gian thực.
   - Duyệt và chuyển trạng thái đơn hàng theo quy trình: Đã đặt ➔ Đang xử lý ➔ Đang giao ➔ Hoàn thành (hoặc Hủy đơn).
   - Tự động nhận chuông thông báo khi có đơn hàng mới phát sinh.

---

## 📌 Clarifications & Business Decisions (Quy tắc Nghiệp vụ)

1. **Quản lý Giỏ hàng độc lập theo Người dùng (User Cart State)**:
   - Mỗi người dùng đã đăng nhập sở hữu 1 giỏ hàng duy nhất (`Cart.UserId`).
   - Sử dụng `CartSignalStore` ở Frontend Angular để đồng bộ số lượng sản phẩm trên thanh Header (Badge giỏ hàng) và cập nhật giá trị giỏ hàng tức thì (Reactive Signal State).
2. **Quy tắc Kiểm tra và Trừ kho khi Đặt hàng (Stock Reservation)**:
   - Khi khách hàng nhấn "Xác nhận đặt hàng", hệ thống kiểm tra tồn kho từng đầu sách:
     - Nếu sách nào có `StockCount < số lượng đặt`, hệ thống lập tức ném lỗi và từ chối đặt hàng.
     - Nếu hợp lệ, hệ thống thực hiện trừ kho trực tiếp: `book.StockCount -= count`.
3. **Áp dụng Mã giảm giá (Coupon Integration)**:
   - Tích hợp trực tiếp với phân hệ Coupon (`001-coupons-promotions`).
   - Kiểm tra điều kiện: Mã đang kích hoạt, trong thời gian hiệu lực, chưa vượt quá số lượt dùng toàn hệ thống, đơn hàng đạt giá trị tối thiểu (`MinOrderAmount`), và mỗi tài khoản chỉ được dùng 1 lần duy nhất.
   - Hỗ trợ 2 hình thức chiết khấu: Giảm theo % (có áp trần `MaxDiscountAmount`) hoặc Giảm theo số tiền cố định.
4. **Cơ chế Hủy đơn hàng và Hoàn trả (Cancellation & Restoration Workflow)**:
   - Khách hàng chỉ được quyền tự hủy đơn khi đơn hàng ở trạng thái **Đã đặt (`Placed`)** hoặc **Đang xử lý (`Processing`)**. Khi đơn đã chuyển sang **Đang giao (`Shipped`)** hoặc **Hoàn thành (`Completed`)**, khách hàng không thể tự hủy.
   - **Khi hủy đơn hàng thành công, hệ thống tự động kích hoạt chuỗi hoàn trả 3 bước**:
     1. **Hoàn kho:** Cộng trả lại số lượng sách vào kho (`book.StockCount += count`).
     2. **Hoàn giỏ hàng:** Tự động nạp lại các món sách của đơn đã hủy vào giỏ hàng của khách để khách không phải tìm chọn lại sách.
     3. **Hoàn mã giảm giá:** Nếu đơn hàng có dùng mã coupon, tự động giảm `UsedCount` đi 1 và xóa bản ghi `CouponUsage` để khách có thể sử dụng lại mã đó.
5. **Cơ chế Đổi phương thức thanh toán (Switch Payment Method)**:
   - Cho phép khách hàng chuyển đổi linh hoạt giữa COD và Chuyển khoản VietQR trong lúc đơn hàng đang ở trạng thái `Placed`/`Processing` (ví dụ: chuyển sang COD nếu ứng dụng ngân hàng bị lỗi).
6. **Thanh toán VietQR động (Dynamic VietQR Generation)**:
   - Sinh mã QR thanh toán chuẩn VietQR tự động qua API hình ảnh dựa trên Số tài khoản, Ngân hàng, Số tiền sau chiết khấu và Nội dung chuyển khoản là Mã đơn hàng (`ORD-...`).

---

## User Scenarios & Testing (Kịch bản Người dùng & Kiểm thử)

### User Story 1 - Khách hàng Thao tác với Giỏ hàng (Priority: P1)

Là một **Khách hàng**, tôi muốn thêm sách vào giỏ hàng, tùy chỉnh số lượng hoặc xóa bớt sách để chuẩn bị danh sách mua sắm.

- **Acceptance Scenarios (Gherkin):**
1. **Given** Khách hàng đang ở trang danh mục sách, **When** Nhấn nút "Thêm vào giỏ" ở cuốn sách có giá 100,000₫, **Then** Badge giỏ hàng trên thanh Menu tăng thêm 1 và hiển thị thông báo "Đã thêm vào giỏ hàng".
2. **Given** Khách hàng đang ở màn hình Giỏ hàng, **When** Bấm dấu (+) để tăng số lượng từ 1 lên 3, **Then** Tổng tiền cuốn sách cập nhật thành 300,000₫ và tổng thanh toán giỏ hàng tự động tính lại.
3. **Given** Cuốn sách trong giỏ có số lượng là 1, **When** Khách hàng bấm nút Xóa (thùng rác), **Then** Cuốn sách được xóa khỏi giỏ hàng và danh mục cập nhật lại ngay lập tức.

---

### User Story 2 - Khách hàng Đặt hàng & Áp dụng Mã giảm giá (Priority: P1)

Là một **Khách hàng**, tôi muốn nhập thông tin nhận hàng, nhập mã giảm giá và chọn phương thức thanh toán (COD hoặc VietQR) để hoàn tất việc mua hàng.

- **Acceptance Scenarios (Gherkin):**
1. **Given** Giỏ hàng có tổng tiền 400,000₫ và khách hàng nhập mã `GIAM50K`, **When** Áp dụng mã thành công, **Then** Tiền giảm hiển thị `-50,000₫`, tổng thanh toán cuối cùng là `350,000₫`.
2. **Given** Khách hàng chọn phương thức thanh toán "Chuyển khoản VietQR", **When** Bấm "Xác nhận đặt hàng", **Then** Đơn hàng được tạo thành công, giao diện hiển thị mã VietQR kèm thông tin số tài khoản và nội dung chuyển khoản là mã đơn hàng (`ORD-xxxxxxxx`).
3. **Given** Đơn hàng tạo thành công, **When** Kiểm tra giỏ hàng và kho sách, **Then** Toàn bộ sản phẩm trong giỏ hàng được làm rỗng, và tồn kho sách trong hệ thống bị trừ đi đúng bằng số lượng đã mua.

---

### User Story 3 - Khách hàng Hủy đơn & Tự động Khôi phục (Priority: P2)

Là một **Khách hàng**, tôi muốn hủy đơn hàng vừa đặt do đổi ý và muốn các sản phẩm được tự động cho lại vào giỏ hàng.

- **Acceptance Scenarios (Gherkin):**
1. **Given** Đơn hàng mới đặt đang ở trạng thái `Placed`, **When** Khách hàng bấm nút "Hủy đơn hàng", **Then** Trạng thái đơn đổi thành `Cancelled`, số lượng tồn kho được cộng hoàn lại, mã coupon được trả lại lượt dùng, và các sách trong đơn được nạp lại vào giỏ hàng.
2. **Given** Đơn hàng đã được Admin chuyển sang trạng thái `Shipped` (Đang giao), **When** Khách hàng xem đơn hàng, **Then** Nút "Hủy đơn hàng" bị ẩn hoặc vô hiệu hóa.

---

### User Story 4 - Quản trị viên Quản lý & Cập nhật Trạng thái Đơn hàng (Priority: P1)

Là một **Quản trị viên (Admin)** có quyền `BookStorePermissions.Orders.Default` và `Edit`, tôi muốn xem toàn bộ đơn hàng của khách, tìm kiếm và duyệt trạng thái đơn hàng.

- **Acceptance Scenarios (Gherkin):**
1. **Given** Có khách hàng vừa đặt đơn mới, **When** Admin đăng nhập, **Then** Chuông thông báo hiển thị thông báo "🎉 Có đơn hàng mới ORD-..." và đơn hàng xuất hiện ở đầu danh sách Đơn hàng.
2. **Given** Đơn hàng đang ở trạng thái `Placed`, **When** Admin chuyển trạng thái sang `Processing` hoặc `Shipped`, **Then** Hệ thống cập nhật trạng thái mới và tự động gửi thông báo đến tài khoản khách hàng.
3. **Given** Đơn hàng đã ở trạng thái `Cancelled` hoặc `Completed`, **When** Admin xem đơn, **Then** Hệ thống khóa không cho thay đổi trạng thái nữa.

---

## 📐 Data Contract & Mô hình Dữ liệu (Data Model)

### 1. Thực thể Giỏ hàng (`AppCarts` & `AppCartItems`)
- **`Cart`** (`FullAuditedAggregateRoot<Guid>, IMultiTenant`):
  - `UserId` (`Guid`): Mã người dùng sở hữu giỏ.
  - `Items` (`ICollection<CartItem>`): Danh sách chi tiết món hàng.
- **`CartItem`** (`CreationAuditedEntity<Guid>, IMultiTenant`):
  - `CartId` (`Guid`): FK liên kết tới `AppCarts`.
  - `BookId` (`Guid`): FK liên kết tới `AppBooks`.
  - `Count` (`int`): Số lượng cuốn sách chọn mua.

### 2. Thực thể Đơn hàng (`AppOrders` & `AppOrderItems`)
- **`Order`** (`FullAuditedAggregateRoot<Guid>, IMultiTenant`):

| Cột dữ liệu | Kiểu dữ liệu | Diễn giải |
| :--- | :--- | :--- |
| `Id` | `Guid` (PK) | Mã định danh đơn hàng |
| `UserId` | `Guid` (FK) | Mã tài khoản khách hàng đặt đơn |
| `OrderNo` | `nvarchar(64)` | Mã đơn hàng duy nhất (`ORD-yyyyMMddHHmmss`) |
| `Status` | `int` (Enum `OrderStatus`) | Trạng thái: 0: Placed, 1: Processing, 2: Shipped, 3: Completed, 4: Cancelled |
| `TotalAmount` | `decimal(18,2)` | Tổng số tiền thanh toán cuối cùng |
| `ReceiverName` | `nvarchar(128)` | Họ tên người nhận hàng |
| `ReceiverPhone`| `nvarchar(32)` | Số điện thoại nhận hàng |
| `ShippingAddress`| `nvarchar(512)` | Địa chỉ giao hàng chi tiết |
| `PaymentMethod`| `int` (Enum) | 0: COD, 1: VietQR, 2: MoMo |
| `PaymentStatus`| `int` (Enum) | 0: Unpaid, 1: Paid |
| `CouponCode` | `nvarchar(64)?` | Mã giảm giá đã dùng (nếu có) |
| `DiscountAmount`| `decimal(18,2)`| Số tiền chiết khấu được giảm |

- **`OrderItem`** (`CreationAuditedEntity<Guid>, IMultiTenant`):
  - `OrderId` (`Guid`): FK tới `AppOrders`.
  - `BookId` (`Guid`): FK tới `AppBooks`.
  - `Count` (`int`): Số lượng sách đã mua.
  - `UnitPrice` (`decimal(18,2)`): Đơn giá tại thời điểm chốt đơn.

---

## 🔌 API Contracts (`ICartAppService` & `IOrderAppService`)

### Cart APIs:
- `GET /api/app/cart`: Lấy thông tin giỏ hàng của người dùng hiện tại kèm chi tiết sách và giá.
- `POST /api/app/cart/to-cart`: Thêm sách vào giỏ hàng (`AddBookToCartDto`).
- `PUT /api/app/cart/cart-item?bookId={}&count={}`: Cập nhật số lượng của một cuốn sách trong giỏ.
- `DELETE /api/app/cart/from-cart?bookId={}`: Xóa cuốn sách khỏi giỏ hàng.

### Order APIs:
- `POST /api/app/order`: Đặt hàng mới (Validate giỏ, trừ kho, tính coupon, trừ giỏ, bắn thông báo).
- `GET /api/app/order/my-orders`: Lấy lịch sử đơn hàng của người dùng hiện tại (phân trang).
- `GET /api/app/order`: Lấy danh sách toàn bộ đơn hàng cho Admin (lọc theo trạng thái, từ khóa).
- `PUT /api/app/order/{id}/status`: Admin cập nhật trạng thái đơn hàng (`UpdateOrderStatusDto`).
- `PUT /api/app/order/{id}/switch-payment-method`: Khách hàng đổi phương thức thanh toán.
- `POST /api/app/order/{id}/cancel-my-order`: Khách hàng tự hủy đơn hàng (hoàn kho, hoàn giỏ, hoàn mã coupon).
