# Feature Specification: Book Reviews & Ratings (Đánh Giá & Nhận Xét Sách)

**Feature Branch**: `006-book-reviews`  
**Created**: 2026-09-29 | **Last Clarified**: 2026-09-29  
**Status**: Clarified & Implemented (Reverse Specification)  
**Tài liệu liên quan**:
- Entity Backend: `aspnet-core/src/Acme.BookStore.Domain/BookReviews/BookReview.cs`
- Contracts & DTOs: `aspnet-core/src/Acme.BookStore.Application.Contracts/BookReviews/`
- Service Implementation: `aspnet-core/src/Acme.BookStore.Application/BookReviews/BookReviewAppService.cs`
- Giao diện Admin: `angular/src/app/features/admin/AdminReviews/`
- Giao diện Storefront (Khách xem & gửi đánh giá): tích hợp trong `angular/src/app/features/admin/Books/book.component.html` / `ts`

---

## 📌 Tổng quan Nghiệp vụ (Business Overview)

Chức năng **Đánh giá & Bình luận Sách (Book Reviews & Ratings)** cung cấp tính năng bằng chứng xã hội (Social Proof) và xây dựng cộng đồng độc giả cho `Acme.BookStore`:
1. **Khách hàng (Customer):**
   - Xem tổng hợp điểm số sao trung bình (từ 1 đến 5 sao) và danh sách nhận xét của các độc giả khác trước khi quyết định mua sách.
   - Gửi đánh giá sao kèm lời bình luận cá nhân cho cuốn sách mình đã đọc hoặc quan tâm.
   - Xem các gợi ý sách liên quan (cùng tác giả, cùng thể loại) được tính toán tự động dựa trên cuốn sách đang xem.
2. **Quản trị viên (Admin):**
   - Quản lý toàn bộ danh sách đánh giá của khách hàng trên toàn hệ thống trong trang Quản trị (`/admin/reviews`).
   - Lọc đánh giá theo số sao (ví dụ: chỉ lọc đánh giá 1 sao hoặc 5 sao) hoặc tìm kiếm theo nội dung bình luận, tên khách hàng.
   - Kiểm duyệt và xóa bỏ các đánh giá có nội dung thô tục, spam hoặc không phù hợp để bảo vệ uy tín cửa hàng.

---

## 📌 Clarifications & Business Decisions (Quy tắc Nghiệp vụ)

1. **Quy định Thang điểm Đánh giá (Rating Scale Constraints)**:
   - Thang điểm đánh giá bắt buộc từ **1 sao đến 5 sao** (`Math.Clamp(rating, 1, 5)`).
   - Điểm đánh giá trung bình (`AverageRating`) được tính bằng trung bình cộng số sao của tất cả các đánh giá của cuốn sách đó và làm tròn 1 chữ số thập phân (ví dụ: `4.8 ★`).
   - Nếu cuốn sách chưa có lượt đánh giá nào, điểm mặc định hiển thị là `5.0 ★`.
2. **Quy tắc Kiểm thực Bình luận (Validation Rules)**:
   - **Nội dung nhận xét (`Comment`)**: Bắt buộc nhập (`[Required]`), độ dài tối đa 1,000 ký tự (`[StringLength(1000)]`).
   - **Định danh người gửi (`UserName`)**: Tự động lấy từ tài khoản đang đăng nhập (`CurrentUser.UserName`). Nếu để trống, hệ thống tự động gán tên hiển thị là *"Khách hàng ẩn danh"*.
3. **Cơ chế Gợi ý Sách Đi kèm (Smart Recommendation System)**:
   - Khi gọi API lấy tóm tắt đánh giá của cuốn sách (`GetSummaryAsync(bookId)`), hệ thống đồng thời tự động truy vấn tìm các cuốn sách khác có cùng Tác giả (`AuthorId`) hoặc cùng Thể loại (`Type`) để trả về làm danh sách gợi ý độc giả.
4. **Quyền hạn Kiểm duyệt của Admin (Admin Moderation & Soft Delete)**:
   - Admin có quyền xem và xóa trực tiếp bất kỳ đánh giá nào.
   - Thực thể `BookReview` kế thừa `FullAuditedAggregateRoot<Guid>`, do đó khi Admin xóa đánh giá, hệ thống thực hiện Soft Delete (`IsDeleted = true`) để lưu vết kiểm toán (Audit Trail) mà không làm mất tính toàn vẹn dữ liệu.

---

## User Scenarios & Testing (Kịch bản Người dùng & Kiểm thử)

### User Story 1 - Khách hàng Gửi Đánh giá & Nhận xét cho Sách (Priority: P1)

Là một **Khách hàng đã đăng nhập**, tôi muốn chọn số sao (1-5 sao) và viết nhận xét về cuốn sách để chia sẻ cảm nhận với những độc giả khác.

- **Acceptance Scenarios (Gherkin):**
1. **Given** Khách hàng đã đăng nhập và đang xem chi tiết cuốn sách, **When** Khách chọn 5 sao, gõ nhận xét: "Sách viết rất lôi cuốn, giao hàng nhanh!" và bấm "Gửi đánh giá", **Then** Hệ thống gọi API `POST /api/app/book-review`, lưu thành công và cập nhật lại điểm đánh giá trung bình.
2. **Given** Khách hàng chưa nhập nội dung bình luận, **When** Nhấn nút "Gửi đánh giá", **Then** Hệ thống báo lỗi kiểm thực: *"Vui lòng nhập nội dung đánh giá!"* và không gửi yêu cầu lên server.

---

### User Story 2 - Khách hàng Xem Tóm tắt Đánh giá & Sách gợi ý (Priority: P1)

Là một **Khách hàng**, tôi muốn xem tổng số lượt đánh giá, điểm sao trung bình và danh sách nhận xét trước đó cùng các gợi ý sách tương tự.

- **Acceptance Scenarios (Gherkin):**
1. **Given** Cuốn sách có 2 đánh giá: 1 đánh giá 5 sao và 1 đánh giá 4 sao, **When** Khách mở xem chi tiết sách, **Then** Điểm số trung bình hiển thị là `4.5 ★` và tổng số lượt đánh giá hiển thị là `2 đánh giá`.
2. **Given** Cuốn sách của tác giả "J.K. Rowling", **When** API trả về dữ liệu tóm tắt, **Then** Mục sách gợi ý đề xuất các cuốn sách khác của tác giả này trong cửa hàng.

---

### User Story 3 - Quản trị viên Duyệt & Xóa Đánh giá Vi phạm (Priority: P2)

Là một **Quản trị viên (Admin)**, tôi muốn vào trang Quản lý Đánh giá (`/admin/reviews`), xem danh sách tất cả các đánh giá và xóa những đánh giá vi phạm tiêu chuẩn cộng đồng.

- **Acceptance Scenarios (Gherkin):**
1. **Given** Admin đang ở trang `/admin/reviews`, **When** Chọn bộ lọc "1 sao", **Then** Bảng chỉ hiển thị danh sách các bình luận có số sao là 1.
2. **Given** Một bình luận chứa nội dung phản cảm hoặc spam, **When** Admin bấm nút icon Thùng rác và xác nhận hộp thoại cảnh báo, **Then** Hệ thống gọi API `DELETE /api/app/book-review/{id}`, gỡ bỏ bình luận và tính toán lại điểm trung bình cho cuốn sách liên quan.

---

## 📐 Data Contract & Mô hình Dữ liệu (Data Model)

### Thực thể Đánh giá Sách (`AppBookReviews`)
Kế thừa `FullAuditedAggregateRoot<Guid>, IMultiTenant`:

| Cột dữ liệu | Kiểu dữ liệu | Ràng buộc | Diễn giải |
| :--- | :--- | :--- | :--- |
| `Id` | `Guid` (PK) | Not Null | Mã định danh duy nhất của đánh giá |
| `BookId` | `Guid` (FK) | Not Null | Mã cuốn sách được đánh giá |
| `UserId` | `Guid` (FK) | Not Null | Mã tài khoản người gửi đánh giá |
| `UserName` | `nvarchar(256)` | Not Null | Tên hiển thị của người đánh giá |
| `Rating` | `int` | Range [1, 5] | Số sao đánh giá (1 đến 5) |
| `Comment` | `nvarchar(1000)`| Not Null, Max 1000| Nội dung bình luận / nhận xét |
| `TenantId` | `Guid?` | Nullable | Multi-tenancy ID |
| `IsDeleted` | `bit` | Default `0` | Cờ xóa mềm (Soft Delete) |
| `CreationTime` | `datetime2` | Not Null | Thời điểm gửi đánh giá |

---

## 🔌 API Contracts & Endpoints (`IBookReviewAppService`)

| Phương thức | Đường dẫn API | Diễn giải |
| :--- | :--- | :--- |
| `GET` | `/api/app/book-review/summary?bookId={guid}` | Lấy tóm tắt đánh giá, điểm TB và danh sách sách gợi ý |
| `GET` | `/api/app/book-review/list-admin?filter={}&rating={}` | Admin lấy danh sách toàn bộ đánh giá (lọc từ khóa, lọc số sao) |
| `POST` | `/api/app/book-review` | Khách hàng gửi đánh giá mới (`CreateBookReviewDto`) |
| `DELETE` | `/api/app/book-review/{id}` | Admin xóa / gỡ bỏ một đánh giá |
