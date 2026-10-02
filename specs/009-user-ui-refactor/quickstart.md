# Quickstart & Verification Guide: User-Facing UI/UX Modernization (009-user-ui-refactor)

**Date**: 2026-10-02  
**Feature**: [spec.md](./spec.md)  
**Status**: Ready  

---

## 1. Môi Trường & Thiết Lập Ban Đầu (Prerequisites)

Hệ thống đang chạy nền sẵn sàng:
- **Backend API**: `aspnet-core/src/Acme.BookStore.HttpApi.Host` (`https://localhost:44305` hoặc cổng cấu hình hiện tại)
- **Frontend Angular**: `angular/` (`http://localhost:4200`)
- **Tài khoản kiểm thử**:
  - Khách vãng lai: Chưa đăng nhập (ẩn danh)
  - Khách hàng đã đăng nhập: `user` / `User123!` (hoặc tương đương)
  - Quản trị viên: `admin` / mật khẩu quản trị

---

## 2. Kịch Bản Kiểm Thử & Xác Nhận (Step-by-Step Validation Scenarios)

### Kịch bản 1: Kiểm thử Giao diện Thư viện Số & Nút Chuyển Dark Mode
1. Mở trình duyệt truy cập `http://localhost:4200/`.
2. **Quan sát**:
   - Header hiển thị logo cuốn sách, thanh tìm kiếm ở giữa, các nút điều hướng và nút Mặt trời/Mặt trăng.
   - Hero slider chạy êm dịu, không giật khung hình.
   - Bảng màu chuẩn Xanh dương `#1e40af` và Nền Trắng `#ffffff`.
3. Nhấp vào icon **Mặt trăng (Theme Toggle)** trên Header:
   - Toàn bộ giao diện Storefront chuyển tức thì sang tông **Dark Navy (`#0b1329`)**, chữ chuyển màu sáng bạc dịu mắt.
   - Tải lại trang (F5): Giao diện vẫn duy trì Dark Mode (được lưu trong `localStorage`).
   - Nhấp icon **Mặt trời**: Giao diện quay lại Light Mode mượt mà.

---

### Kịch bản 2: Duyệt Danh Mục Sách & Phân Trang Số (`/books`)
1. Truy cập trang `http://localhost:4200/books`.
2. **Kiểm tra Sidebar Lọc**:
   - Chọn thể loại sách và khoảng giá.
   - Danh sách sách tự động cập nhật, có khung xương Skeleton shimmer mờ trong lúc tải.
3. **Kiểm tra Phân trang Số**:
   - Nhìn thấy thanh phân trang: `Trước`, `1`, `2`, `3...`, `Sau` và bộ chọn số lượng `12 / 24 / 48`.
   - Bấm sang trang `2`: URL chuyển thành `http://localhost:4200/books?page=2`, màn hình tự động cuộn nhẹ lên đầu danh sách sách.

---

### Kịch bản 3: Thao tác Giỏ Hàng & Phản Hồi Toast (Tuyệt đối Không Có `alert()`)
1. Trên thẻ sách bất kỳ ở Trang chủ hoặc Danh mục, bấm nút **"Thêm vào giỏ"**.
2. **Kết quả kỳ vọng**:
   - Badge số lượng giỏ hàng trên Header tăng lên ngay lập tức (phản ứng tức thời qua Angular Signals).
   - Một thông báo Toast màu xanh bo tròn xuất hiện nhẹ nhàng ở góc màn hình: *"Đã thêm sách vào giỏ hàng thành công!"*.
   - Không xuất hiện bất kỳ cửa sổ popup chặn trình duyệt (`window.alert`).
3. Truy cập `http://localhost:4200/cart`:
   - Bảng sản phẩm hiển thị đầy đủ, tăng giảm số lượng bằng nút `+` / `-`, cột tổng thanh toán tính lại tức thì.

---

### Kịch bản 4: Luồng Thanh Toán & Đặt Hàng Riêng Biệt (`/checkout`)
1. Tại trang giỏ hàng, bấm nút lớn **"Tiến hành thanh toán"**.
2. Hệ thống chuyển hướng sang trang `http://localhost:4200/checkout`:
   - Cột trái: Form điền thông tin người nhận hàng, địa chỉ, chọn phương thức thanh toán `COD` hoặc `VietQR`.
   - Cột phải: Khối tóm tắt đơn hàng cố định.
3. Điền thông tin và bấm **"Xác nhận Đặt hàng"**:
   - Đơn hàng được tạo thành công, hệ thống hiển thị mã đơn và mã VietQR động (nếu chọn VietQR) hoặc chuyển sang chi tiết đơn hàng.

---

### Kịch bản 5: Bố Cục 2 Nút Chat Nổi (Live Support & AI Gemini)
1. Quan sát góc dưới bên phải màn hình:
   - Nút phía trên: Icon tai nghe màu xanh dương đậm (Live Support Chat).
   - Nút phía dưới: Icon robot màu tím gradient (AI Gemini Assistant).
2. Nhấp vào nút Live Support: Cửa sổ chat với nhân viên bung mở.
3. Nhấp vào nút AI Gemini: Cửa sổ Live Support đóng lại, cửa sổ trợ lý ảo AI mở ra với lời chào và các gợi ý sách.

---

### Kịch bản 6: Kiểm Định Độc Lập Khỏi Giao Diện Quản Trị (Admin Isolation)
1. Đăng nhập bằng tài khoản `admin`.
2. Truy cập các trang quản trị:
   - `http://localhost:4200/dashboard`
   - `http://localhost:4200/admin-orders`
   - `http://localhost:4200/authors`
3. **Kết quả kỳ vọng**:
   - Toàn bộ giao diện LeptonX Admin (Sidebar menu, breadcrumbs, bảng dữ liệu admin) giữ nguyên vẹn 100%, không bị ảnh hưởng bởi scoped styles của Storefront.
