# Quickstart: Kiểm thử & Vận hành Chức năng Coupons & Promotions

**Feature**: Coupons and Promotions Management  
**Branch**: `001-coupons-promotions`  
**Date**: 2026-09-28  

---

## 1. Dành cho Admin: Quản lý Mã Giảm Giá

1. Đăng nhập với tài khoản **Admin**.
2. Truy cập menu Quản trị: **Mã giảm giá** (`/admin/coupons`).
3. Bấm **"Thêm mới Voucher"**:
   - Nhập Mã: `CHAOBANMOI`
   - Tên chương trình: `Khuyến mãi Mừng Khách Mới`
   - Loại giảm: `Giảm theo %`
   - Giá trị giảm: `15%`
   - Giảm tối đa: `50,000₫`
   - Đơn tối thiểu: `100,000₫`
   - Tổng lượt dùng: `50`
   - Hạn dùng: 30 ngày tới.
4. Bấm **Lưu**: Kiểm tra danh sách hiển thị đúng mã vừa tạo.
5. Thử bấm nút gạt **Bật / Tắt trạng thái** (`IsActive`).

---

## 2. Dành cho Khách hàng: Áp dụng Mã & Thanh toán VietQR

1. Đăng nhập tài khoản Khách hàng.
2. Thêm 1 hoặc nhiều cuốn sách vào Giỏ hàng sao cho tổng tiền trên `100,000₫` (ví dụ: `250,000₫`).
3. Mở Giỏ hàng hoặc trang Đặt hàng (Checkout):
   - Thấy khung nhập **"Nhập mã giảm giá (Coupon)"**.
   - Gõ `chaobanmoi` (kiểm tra tự động in hoa và trim khoảng trắng).
   - Nhấn **"Áp dụng"**.
4. **Kiểm tra phản hồi reactive (Angular Signals)**:
   - Dòng "Mã giảm giá: CHAOBANMOI (-37,500₫)" hiển thị.
   - Tổng thanh toán giảm từ `250,000₫` xuống còn `212,500₫`.
   - **Mã VietQR động**: Tự động render lại với số tiền `212,500₫`.
5. Bấm **"Đặt hàng"**:
   - Đơn hàng được tạo thành công với thông tin `CouponCode = CHAOBANMOI` và `DiscountAmount = 37,500₫`.
   - Lượt dùng của mã tăng từ `0` lên `1`.
6. Thử tạo đơn tiếp theo và nhập lại mã `CHAOBANMOI`:
   - Hệ thống báo lỗi: *"Bạn đã sử dụng mã giảm giá này rồi (mỗi tài khoản chỉ được dùng 1 lần)."*
