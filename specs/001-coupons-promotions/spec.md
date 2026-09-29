# Feature Specification: Coupons and Promotions Management (Mã Giảm Giá & Khuyến Mãi)

**Feature Branch**: `001-coupons-promotions`

**Created**: 2026-09-28 | **Last Clarified**: 2026-09-28

**Status**: Clarified

**Input**: User description: "Xây dựng tính năng Mã giảm giá (Coupons & Promotions) cho Acme.BookStore:
- Admin: Thêm/Sửa/Xóa mã giảm giá gồm: Mã Code, Tên chương trình, Loại giảm (phần trăm % hoặc số tiền cố định ₫), Giá trị giảm, Giá trị đơn hàng tối thiểu, Số lượt dùng tối đa, Ngày bắt đầu & Ngày hết hạn, Trạng thái kích hoạt.
- User (Khách hàng): Tại màn hình Giỏ hàng (Cart) hoặc Đặt hàng (Checkout), nhập mã giảm giá -> Kiểm tra tính hợp lệ và áp dụng trừ tiền -> Cập nhật lại số tiền thanh toán VietQR.
- Ràng buộc: Một mã chỉ được dùng nếu còn hạn, còn lượt và đơn hàng đạt giá trị tối thiểu."

---

## 📌 Clarifications & Business Decisions *(Updated via /speckit.clarify)*

1. **Giới hạn lượt dùng theo từng khách hàng (Per-User Limit)**: Mỗi tài khoản khách hàng (`UserId`) chỉ được sử dụng mỗi mã giảm giá **1 lần duy nhất** (tránh trường hợp 1 khách dùng hết toàn bộ quota của mã).
2. **Trần giảm giá tối đa (Max Discount Amount)**: Đối với loại giảm theo phần trăm (%), bổ sung trường `MaxDiscountAmount` (ví dụ: Giảm 20% nhưng tối đa không quá 100,000₫) để kiểm soát ngân sách khuyến mãi.
3. **Hoàn lượt khi Hủy đơn (Order Cancellation)**: Khi đơn hàng đã áp dụng mã bị hủy (Cancelled) hoặc từ chối, hệ thống **tự động hoàn lại lượt sử dụng** (giảm `UsedCount` đi 1) và cho phép khách hàng sử dụng lại mã đó cho đơn hàng tiếp theo.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Khách hàng áp dụng Mã Giảm Giá khi Thanh Toán (Priority: P1)

Là một Khách hàng (Storefront User), khi vào màn hình Giỏ hàng hoặc Thanh toán, tôi muốn nhập mã coupon khuyến mãi để được giảm giá đơn hàng và thấy số tiền thanh toán (kèm mã VietQR) tự động cập nhật giảm đi tương ứng.

**Why this priority**: Đây là giá trị cốt lõi mang lại trải nghiệm mua sắm và chuyển đổi doanh số cho sàn thương mại điện tử, trực tiếp liên quan đến dòng tiền và thanh toán đơn hàng.

**Independent Test**: Tạo 1 mã giảm giá hợp lệ trong hệ thống, mở giỏ hàng có sách, nhập mã vào ô Coupon và bấm "Áp dụng", kiểm tra xem tiền tạm tính có bị trừ chính xác và số tiền sinh mã VietQR có giảm đúng bằng số tiền sau chiết khấu không.

**Acceptance Scenarios**:

1. **Given** Khách hàng có giỏ hàng với tổng tiền 300,000₫ và có mã giảm giá `GIAM50K` (giảm 50,000₫ cho đơn từ 200,000₫), **When** Khách hàng nhập mã `GIAM50K` và nhấn Áp dụng, **Then** Hệ thống thông báo áp dụng thành công, hiển thị dòng "Giảm giá voucher: -50,000₫", tổng thanh toán cập nhật thành 250,000₫ và mã VietQR sinh ra ứng với số tiền 250,000₫.
2. **Given** Khách hàng có đơn hàng 1,000,000₫ và áp dụng mã `GIAM20PT` (giảm 20%, trần tối đa 100,000₫), **When** Áp dụng mã, **Then** Hệ thống chỉ giảm tối đa 100,000₫ thay vì 200,000₫, tổng thanh toán là 900,000₫.
3. **Given** Khách hàng đã từng sử dụng thành công mã `CHAOBANMOI` trong một đơn hàng trước đó, **When** Khách hàng nhập lại mã `CHAOBANMOI`, **Then** Hệ thống báo lỗi: "Bạn đã sử dụng mã giảm giá này rồi (mỗi khách hàng chỉ được dùng 1 lần)".
4. **Given** Khách hàng có giỏ hàng 150,000₫ và có mã `GIAM10PT` (giảm 10% cho đơn tối thiểu 200,000₫), **When** Khách hàng nhập mã và nhấn Áp dụng, **Then** Hệ thống báo lỗi "Đơn hàng chưa đạt giá trị tối thiểu 200,000₫ để áp dụng mã này" và không trừ tiền.
5. **Given** Mã giảm giá đã hết hạn sử dụng hoặc đã dùng hết số lượt (`UsedCount >= MaxUsageCount`), **When** Khách hàng nhập mã và nhấn Áp dụng, **Then** Hệ thống báo lỗi "Mã giảm giá đã hết hạn hoặc hết lượt sử dụng".
6. **Given** Khách hàng đã áp dụng mã giảm giá, **When** Khách hàng nhấn nút "Hủy mã", **Then** Giỏ hàng khôi phục lại tổng tiền ban đầu.

---

### User Story 2 - Quản trị viên Quản lý Mã Giảm Giá (Admin CRUD) (Priority: P2)

Là Quản trị viên hệ thống (Admin), tôi muốn xem danh sách, thêm mới, chỉnh sửa thông tin, hoặc xóa/vô hiệu hóa các mã khuyến mãi trong trang Admin để tổ chức các chiến dịch tiếp thị.

**Why this priority**: Cung cấp công cụ cho Admin chủ động phát hành voucher, kiểm soát ngân sách khuyến mãi và thời hạn áp dụng.

**Independent Test**: Trong trang Quản trị Admin: Mở trang Quản lý Coupon, tạo mã mới với đầy đủ thông số (kèm `MaxDiscountAmount` nếu là %), sửa thông tin, đổi trạng thái hoạt động (Active/Inactive) và kiểm tra danh sách hiển thị đúng.

**Acceptance Scenarios**:

1. **Given** Admin đang ở trang Quản lý Khuyến mãi, **When** Nhấn "Tạo mã giảm giá mới", điền Code `HE2026`, loại giảm 20%, trần giảm tối đa 100,000₫, hạn dùng 7 ngày, **Then** Hệ thống lưu thành công và hiển thị mã mới trên bảng danh sách.
2. **Given** Mã giảm giá đang ở trạng thái Hoạt động (`IsActive = true`), **When** Admin bấm chuyển trạng thái sang `IsActive = false`, **Then** Khách hàng không thể áp dụng mã này nữa.
3. **Given** Một mã giảm giá đã có đơn hàng sử dụng, **When** Admin chọn xóa mã, **Then** Hệ thống chuyển sang trạng thái Soft Delete / Vô hiệu hóa để bảo toàn dữ liệu lịch sử đơn hàng.

---

### User Story 3 - Xử lý Vòng đời & Hoàn Lượt khi Đặt/Hủy đơn (Priority: P3)

Là Hệ thống bán hàng, khi Khách hàng đặt hàng thành công, hệ thống ghi nhận lượt dùng mã. Nếu đơn hàng bị hủy, hệ thống hoàn lại lượt dùng cho khách.

**Why this priority**: Đảm bảo công bằng cho khách hàng và tính toàn vẹn dữ liệu khuyến mãi.

**Independent Test**: Tạo đơn hàng với mã có giới hạn 1 lượt, kiểm tra mã bị khóa lượt. Sau đó hủy đơn hàng, kiểm tra khách hàng có thể nhập lại mã này thành công.

**Acceptance Scenarios**:

1. **Given** Khách hàng A tạo đơn hàng thành công với mã `VIP100`, **When** Đơn hàng tạo xong, **Then** `UsedCount` tăng lên 1, ghi nhận bản ghi sử dụng của User A.
2. **Given** Đơn hàng của Khách hàng A bị Hủy (Cancelled), **When** Trạng thái đơn hàng chuyển sang `Cancelled`, **Then** `UsedCount` của mã `VIP100` giảm đi 1, bản ghi sử dụng được giải phóng để Khách hàng A có thể tái sử dụng mã.

---

### Edge Cases

- **Mã viết hoa / viết thường**: Khách hàng nhập `giam50k` hoặc `GIAM50K` hoặc có khoảng trắng thừa đầu/cuối: Hệ thống tự động `trim()` và chuyển thành chữ in hoa (`ToUpper()`).
- **Giảm giá vượt quá giá trị đơn hàng**: Đối với loại giảm tiền cố định (Ví dụ: Giảm 50,000₫ nhưng tiền hàng chỉ có 40,000₫), số tiền giảm tối đa chỉ bằng tổng giá trị hàng (Tổng thanh toán không bao giờ âm, tối thiểu 0₫).
- **Thay đổi giỏ hàng sau khi đã áp mã**: Nếu khách hàng xóa bớt sách khiến tổng tiền giỏ hàng tụt xuống dưới mức `MinOrderAmount`, hệ thống tự động thông báo và hủy áp dụng mã.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI cho phép Admin thực hiện đầy đủ các thao tác Thêm, Xem phân trang/tìm kiếm, Cập nhật, Xóa/Bật/Tắt mã giảm giá.
- **FR-002**: Mỗi mã giảm giá PHẢI có thuộc tính: `Code` (duy nhất, không trùng lặp), `Title` (Tên chương trình), `DiscountType` (Phần trăm hoặc Tiền mặt cố định), `DiscountValue`, `MaxDiscountAmount` (trần giảm tối đa cho %), `MinOrderAmount`, `MaxUsageCount`, `UsedCount`, `StartDate`, `EndDate`, `IsActive`.
- **FR-003**: Hệ thống PHẢI cung cấp API kiểm tra tính hợp lệ của mã (`ValidateCouponAsync(code, orderTotal)`) kiểm tra: tồn tại, trạng thái Active, hạn dùng, số lượt còn lại, giá trị đơn hàng tối thiểu, và kiểm tra xem User hiện tại đã từng dùng mã này chưa.
- **FR-004**: Tầng `Application.Contracts` PHẢI kế thừa `IApplicationService` trực tiếp cho `ICouponAppService`, tuyệt đối KHÔNG dùng generic `ICrudAppService<...>`.
- **FR-005**: Giao diện Quản trị và Khách hàng trên Angular PHẢI sử dụng Angular Signals (`signal`, `computed`), luồng dữ liệu 1 chiều (One-Way Binding) và cú pháp `@if`, `@for`.
- **FR-006**: Khi áp dụng mã giảm giá thành công, màn hình Thanh toán PHẢI tự động cập nhật số tiền hiển thị và tạo lại mã VietQR tương ứng với số tiền thực thu sau giảm giá.
- **FR-007**: Khi đơn hàng bị Hủy (Cancelled), hệ thống PHẢI tự động hoàn lại lượt dùng mã giảm giá cho khách hàng.
- **FR-008**: Toàn bộ thông báo phản hồi (thành công, lỗi hết hạn, chưa đủ tiền tối thiểu, đã từng sử dụng) PHẢI bằng Tiếng Việt 100%.

### Key Entities *(include if feature involves data)*

- **Coupon (Aggregate Root)**:
  - `Id`: `Guid`
  - `Code`: `string` (ví dụ: `SUMMER2026`, unique, in hoa)
  - `Title`: `string` (Tên hiển thị chiến dịch)
  - `DiscountType`: `enum DiscountType { Percentage = 1, FixedAmount = 2 }`
  - `DiscountValue`: `decimal` (Ví dụ 10 tương ứng 10%, hoặc 50000 tương ứng 50,000₫)
  - `MaxDiscountAmount`: `decimal?` (Trần tiền giảm tối đa đối với loại %)
  - `MinOrderAmount`: `decimal` (Giá trị đơn tối thiểu để áp dụng)
  - `MaxUsageCount`: `int` (Tổng số lượt sử dụng tối đa của mã)
  - `UsedCount`: `int` (Số lượt thực tế đã dùng toàn hệ thống)
  - `StartDate`: `DateTime`
  - `EndDate`: `DateTime`
  - `IsActive`: `bool` (Bật / Tắt nhanh)
- **CouponUsage**:
  - `Id`: `Guid`
  - `CouponId`: `Guid`
  - `UserId`: `Guid`
  - `OrderId`: `Guid`
  - `DiscountAmount`: `decimal`
  - `UsedTime`: `DateTime`
- **Order (Cập nhật liên kết)**:
  - `CouponCode`: `string?` (Lưu mã đã dùng tại thời điểm chốt đơn)
  - `DiscountAmount`: `decimal` (Số tiền thực tế đã giảm)

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Khách hàng áp dụng mã giảm giá hợp lệ và thấy số tiền đơn hàng + mã VietQR cập nhật ngay lập tức trong thời gian phản hồi dưới 500ms.
- **SC-002**: 100% các trường hợp (mã hết hạn, sai mã, chưa đủ tiền tối thiểu, vượt quá trần, đã từng sử dụng) đều hiển thị thông báo lỗi Tiếng Việt rõ ràng, chính xác.
- **SC-003**: Admin có thể tạo và kích hoạt 1 mã giảm giá mới trong vòng dưới 1 phút.
- **SC-004**: Không có bất kỳ lỗi xung đột dữ liệu hoặc âm tiền thanh toán nào trong quá trình tính toán chiết khấu.

---

## Assumptions

- Mã giảm giá áp dụng trên tổng giá trị sách của đơn hàng (chưa bao gồm phí vận chuyển nếu có).
- Mỗi đơn hàng chỉ áp dụng tối đa 1 mã giảm giá duy nhất (không cộng dồn nhiều voucher).
- Tính năng tuân thủ toàn bộ quy tắc kỹ thuật trong [`constitution.md`](file:///c:/Users/takag/Acme.BookStore/.specify/memory/constitution.md) (Backend `IApplicationService` tường minh; Frontend Angular Signals & One-way binding).
