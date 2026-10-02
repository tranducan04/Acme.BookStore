# Feature Specification: Admin Analytics Dashboard (Bảng Điều Khiển & Thống Kê Doanh Thu)

**Feature Branch**: `008-admin-dashboard`  
**Created**: 2026-09-29 | **Last Clarified**: 2026-09-29  
**Status**: Clarified & Implemented (Reverse Specification)  
**Tài liệu liên quan**:
- Frontend Dashboard Component: `angular/src/app/features/admin/Dashboard/dashboard.component.ts`
- Template & Style: `dashboard.component.html`, `dashboard.component.scss`
- Backend APIs consumed:
  - `IBookAppService.GetListAsync()` (Tổng số sách & cơ cấu thể loại)
  - `IOrderAppService.GetListAsync()` (Doanh thu & trạng thái đơn hàng)

---

## 📌 Tổng quan Nghiệp vụ (Business Overview)

Chức năng **Bảng điều khiển Quản trị (Admin Analytics Dashboard)** đóng vai trò là "Trung tâm chỉ huy" (Command Center) dành cho ban quản trị cửa hàng `Acme.BookStore`. 
- **Mục tiêu:** Cung cấp bức tranh toàn cảnh trực quan về tình hình kinh doanh, doanh thu bán hàng, cơ cấu hàng hóa trong kho và tiến độ xử lý đơn hàng theo thời gian thực.
- **Đối tượng sử dụng:** Quản trị viên hệ thống (Admin), Quản lý bán hàng có quyền truy cập trang quản trị.

---

## 📌 Clarifications & Business Decisions (Quy tắc Nghiệp vụ)

1. **Quy tắc Tính toán Doanh thu Hợp lệ (Revenue Calculation Rule)**:
   - Tổng doanh thu (`TotalRevenue`) được tính bằng tổng trường `TotalAmount` của tất cả các đơn hàng **ngoại trừ các đơn đã bị hủy** (`Status != OrderStatus.Cancelled`).
   - Các đơn hàng đang giao (`Shipped`) hoặc đã đặt (`Placed`) đều được tính vào doanh thu dự kiến, giúp Admin nắm bắt dòng tiền phát sinh.
2. **Theo dõi Đơn hàng Cần xử lý Gấp (Pending Action Tracker)**:
   - Chỉ số `PendingOrdersCount` gom nhóm các đơn hàng ở trạng thái **Đã đặt (`Placed` - 0)** và **Đang xử lý (`Processing` - 1)** để nhắc nhở Admin nhanh chóng đóng gói và bàn giao vận chuyển.
3. **Cơ chế Lọc Nhanh Tương tác theo Thẻ (Interactive Drill-down Popup)**:
   - Khi Admin bấm vào từng thẻ KPI (ví dụ: bấm vào thẻ "Đơn chờ xử lý" hoặc "Đơn hàng đã hoàn thành"), hệ thống mở một Popup Dialog hiển thị chi tiết danh sách các đơn hàng thuộc nhóm đó để xử lý ngay lập tức mà không cần chuyển trang.
4. **Hệ thống 3 Biểu đồ Phân tích Trực quan (Chart.js Integration)**:
   - **Biểu đồ Cột (Bar Chart) - Doanh thu 12 tháng:** Nhóm doanh số theo từng tháng (`T1` đến `T12`) dựa trên `CreationTime` của đơn hàng, giúp nhận biết mùa cao điểm mua sắm.
   - **Biểu đồ Tròn (Doughnut / Pie Chart) - Cơ cấu Sách theo Thể loại:** Phân tích tỷ trọng các thể loại sách (Phiêu lưu, Khoa học, Tiểu sử, Kinh dị...) hiện có trong kho.
   - **Biểu đồ Tỷ lệ (Status Chart) - Trạng thái Đơn hàng:** Thống kê tỷ lệ phần trăm giữa các trạng thái Đã đặt, Đang xử lý, Đang giao, Thành công và Đã hủy.
5. **Tối ưu Hiệu năng Tải dữ liệu (Reactive Parallel Fetching)**:
   - Sử dụng RxJS `forkJoin` để gọi song song 2 luồng API Lấy danh sách Sách và Danh sách Đơn hàng, loại bỏ hiện tượng giật lag khi tải trang.

---

## User Scenarios & Testing (Kịch bản Người dùng & Kiểm thử)

### User Story 1 - Quản trị viên Xem Tổng quan Chỉ số KPI Kinh doanh (Priority: P1)

Là một **Quản trị viên**, khi truy cập vào trang Dashboard, tôi muốn nhìn thấy ngay 4 chỉ số kinh doanh cốt lõi (Doanh thu, Tổng đơn hàng, Đơn chờ xử lý, Tổng số đầu sách) để nắm bắt nhanh tình hình hoạt động.

- **Acceptance Scenarios (Gherkin):**
1. **Given** Cửa hàng có 10 đơn hàng hợp lệ với tổng giá trị 2,500,000₫ và 1 đơn hủy trị giá 300,000₫, **When** Admin mở trang Dashboard, **Then** Thẻ KPI Doanh thu hiển thị chính xác `2,500,000₫` (không cộng đơn hủy).
2. **Given** Có 3 đơn hàng mới đặt và 2 đơn đang xử lý, **When** Admin xem Dashboard, **Then** Thẻ "Đơn chờ xử lý" hiển thị con số `5` với cảnh báo trực quan.
3. **Given** Admin muốn cập nhật số liệu mới nhất, **When** Bấm nút "Làm mới dữ liệu", **Then** Hệ thống gọi lại API song song và cập nhật các chỉ số tức thì kèm hiệu ứng mượt mà.

---

### User Story 2 - Quản trị viên Tương tác Xem Biểu đồ Trực quan (Priority: P1)

Là một **Quản trị viên**, tôi muốn xem các biểu đồ doanh thu theo tháng và cơ cấu thể loại để có định hướng nhập thêm các đầu sách bán chạy.

- **Acceptance Scenarios (Gherkin):**
1. **Given** Dữ liệu đơn hàng phân bổ rải rác từ tháng 1 đến tháng 12, **When** Biểu đồ cột Doanh thu render, **Then** Trục hoành hiển thị 12 tháng (`T1 - T12`), các cột thể hiện chính xác doanh thu theo từng tháng.
2. **Given** Kho sách có 40% sách Phiêu lưu, 30% Tiểu sử và 30% Khoa học, **When** Biểu đồ tròn thể loại hiển thị, **Then** Màu sắc hiển thị phân biệt rõ ràng kèm nhãn thể loại và tỷ lệ phần trăm khi rê chuột (Hover Tooltip).

---

### User Story 3 - Lọc Nhanh Danh sách Đơn hàng từ Thẻ Thống kê (Priority: P2)

Là một **Quản trị viên**, tôi muốn bấm trực tiếp vào thẻ "Đơn chờ xử lý" để xem ngay danh sách những đơn này mà không phải vào mục Quản lý Đơn hàng để tự lọc.

- **Acceptance Scenarios (Gherkin):**
1. **Given** Admin bấm vào thẻ KPI "Đơn chờ xử lý", **When** Popup Dialog mở ra, **Then** Tiêu đề hiển thị "Danh sách đơn hàng chờ xử lý" và bảng chỉ chứa các đơn hàng có trạng thái `Placed` hoặc `Processing`.

---

## 📐 Data Contracts & Cấu trúc Dữ liệu Dashboard

Dashboard tổng hợp dữ liệu từ 2 DTO chính:
1. **`BookDto`** (`Acme.BookStore.Books`):
   - `Type`: Thể loại Enum (`BookType`).
   - `StockCount`: Số lượng tồn kho.
2. **`OrderDto`** (`Acme.BookStore.Orders`):
   - `TotalAmount`: Tổng số tiền đơn hàng.
   - `Status`: Trạng thái đơn (`OrderStatus`: Placed, Processing, Shipped, Completed, Cancelled).
   - `CreationTime`: Thời điểm phát sinh đơn hàng.

---

## 🔌 API Phục vụ Dashboard

| Endpoint | Phương thức | Mục đích |
| :--- | :--- | :--- |
| `/api/app/book?maxResultCount=1000` | `GET` | Thống kê số lượng sách và nhóm theo thể loại |
| `/api/app/order?maxResultCount=1000` | `GET` | Tính tổng doanh thu, tỷ lệ đơn hàng và phân bổ doanh thu theo tháng |
