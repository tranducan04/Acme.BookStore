# Feature Specification: Author Management (Quản Lý Tác Giả)

**Feature Branch**: `004-author-management`  
**Created**: 2026-09-29 | **Last Clarified**: 2026-09-29  
**Status**: Clarified & Implemented (Reverse Specification)  
**Tài liệu liên quan**:
- Entity Backend: `aspnet-core/src/Acme.BookStore.Domain/Authors/Author.cs`
- Contracts & DTOs: `aspnet-core/src/Acme.BookStore.Application.Contracts/Authors/`
- Service Implementation: `aspnet-core/src/Acme.BookStore.Application/Authors/AuthorAppService.cs`
- Giao diện Admin: `angular/src/app/features/admin/Authors/`

---

## 📌 Tổng quan Nghiệp vụ (Business Overview)

Chức năng **Quản lý Tác giả (Author Management)** là mô-đun quản lý thông tin các tác giả, người sáng tác các đầu sách trong hệ thống `Acme.BookStore`.
- **Vai trò trong hệ sinh thái:** Tác giả là thực thể liên kết mật thiết với thực thể Sách (`Book.AuthorId`). Dữ liệu tác giả cung cấp thông tin xuất xứ cho sản phẩm và phục vụ việc chọn tác giả khi Admin nhập sách mới, cũng như tra cứu sách theo tác giả cho khách hàng.
- **Đối tượng sử dụng chính:** Quản trị viên (Admin) phụ trách quản lý danh mục và dữ liệu cửa hàng sách.

---

## 📌 Clarifications & Business Decisions (Quy tắc Nghiệp vụ)

1. **Ràng buộc Toàn vẹn Tham chiếu khi Xóa (Referential Integrity Check)**:
   - Hệ thống **nghiêm cấm xóa tác giả** nếu tác giả đó đang có ít nhất 1 cuốn sách trong cơ sở dữ liệu (`_bookRepository.AnyAsync(x => x.AuthorId == id)`).
   - Nếu vi phạm, hệ thống ném ra ngoại lệ thân thiện `UserFriendlyException`:
     > *"⚠️ Không thể xóa tác giả này vì đang có sách trong cửa hàng! Vui lòng xóa hoặc thay đổi tác giả cho các cuốn sách tương ứng trước."*
2. **Cơ chế Soft Delete (Xóa mềm)**:
   - Thực thể `Author` kế thừa `FullAuditedAggregateRoot<Guid>`, do đó khi xóa thành công (sau khi vượt qua kiểm tra ràng buộc), bản ghi được đánh dấu `IsDeleted = true` chứ không bị xóa vĩnh viễn khỏi CSDL, bảo toàn lịch sử dữ liệu kiểm toán (Audit Log).
3. **Tra cứu Tác giả (Author Lookup for Books)**:
   - Cung cấp API chuyên biệt `GetAuthorLookupAsync()` trả về danh sách rút gọn (`Id`, `Name`) để tối ưu hóa hiệu năng khi đổ dữ liệu vào ô Dropdown chọn Tác giả ở màn hình Thêm/Sửa Sách.
4. **Quy tắc Kiểm thực Dữ liệu (Validation Rules)**:
   - **Tên tác giả (`Name`)**: Bắt buộc nhập (`[Required]`), độ dài tối đa 64 ký tự (`[StringLength(64)]`).
   - **Ngày sinh (`BirthDate`)**: Bắt buộc chọn (`[Required]`), định dạng ngày tháng hợp lệ.
   - **Tiểu sử vắn tắt (`ShortBio`)**: Bắt buộc nhập khi tạo mới tác giả; cho phép cập nhật hoặc để trống khi chỉnh sửa.

---

## User Scenarios & Testing (Kịch bản Người dùng & Kiểm thử)

### User Story 1 - Quản trị viên Xem & Tìm kiếm Danh sách Tác giả (Priority: P1)

Là một **Quản trị viên (Admin)** có quyền `BookStorePermissions.Authors.Default`, tôi muốn xem danh sách các tác giả hiện có và tìm kiếm tức thì theo tên tác giả để tra cứu thông tin nhanh chóng.

- **Why this priority:** Giúp Admin kiểm tra danh sách tác giả hiện có trong hệ thống trước khi gán cho sách hoặc thêm mới.
- **Independent Test:** Mở trang Quản lý Tác giả, nhập tên tác giả vào thanh tìm kiếm và kiểm tra danh sách tự động lọc theo thời gian thực (Reactive Search).

**Acceptance Scenarios (Gherkin):**
1. **Given** Admin truy cập vào màn hình "Quản lý Tác giả", **When** Trang tải hoàn tất, **Then** Bảng danh sách hiển thị tên tác giả, ngày sinh (định dạng `dd/MM/yyyy`) và tiểu sử vắn tắt.
2. **Given** Danh sách đang hiển thị nhiều tác giả, **When** Admin gõ "Nguyễn Nhật Ánh" vào ô tìm kiếm, **Then** Bộ lọc phía máy trạm (Angular Computed Signal) lập tức chỉ hiển thị các tác giả có chứa từ khóa "Nguyễn Nhật Ánh".

---

### User Story 2 - Quản trị viên Thêm mới Tác giả (Priority: P1)

Là một **Quản trị viên (Admin)** có quyền `BookStorePermissions.Authors.Create`, tôi muốn tạo mới hồ sơ tác giả với tên, ngày sinh và tiểu sử để có dữ liệu liên kết khi tạo sách.

- **Why this priority:** Không có tác giả thì không thể hoàn thành việc tạo sách mới theo đúng ràng buộc hệ thống.
- **Independent Test:** Bấm nút "Thêm tác giả mới", nhập thông tin hợp lệ vào form, nhấn "Lưu". Kiểm tra tác giả mới xuất hiện trong bảng và trong dropdown chọn tác giả của màn hình Sách.

**Acceptance Scenarios (Gherkin):**
1. **Given** Admin mở hộp thoại "Thêm tác giả", **When** Điền Tên: "J.K. Rowling", Ngày sinh: "31/07/1965", Tiểu sử: "Tác giả bộ truyện Harry Potter nổi tiếng thế giới" và bấm "Lưu", **Then** Hệ thống gọi API `POST /api/app/author`, tạo thành công và làm mới danh sách tác giả.
2. **Given** Admin để trống trường Tên tác giả và nhấn "Lưu", **When** Form kiểm tra dữ liệu đầu vào, **Then** Hệ thống chặn gửi yêu cầu và hiển thị cảnh báo: *"Vui lòng nhập tên tác giả!"*.

---

### User Story 3 - Quản trị viên Chỉnh sửa Thông tin Tác giả (Priority: P2)

Là một **Quản trị viên (Admin)** có quyền `BookStorePermissions.Authors.Edit`, tôi muốn cập nhật thông tin tên, ngày sinh hoặc tiểu sử của một tác giả đã có.

- **Acceptance Scenarios (Gherkin):**
1. **Given** Admin bấm nút chỉnh sửa (icon cây bút) ở một tác giả, **When** Hộp thoại hiển thị đầy đủ thông tin cũ, Admin sửa lại tiểu sử và nhấn "Lưu", **Then** Hệ thống gọi API `PUT /api/app/author/{id}`, cập nhật dữ liệu và hiển thị thông tin mới trên danh sách.

---

### User Story 4 - Quản trị viên Xóa Tác giả (Priority: P2)

Là một **Quản trị viên (Admin)** có quyền `BookStorePermissions.Authors.Delete`, tôi muốn xóa một tác giả không còn hoạt động, nhưng hệ thống phải bảo vệ tính toàn vẹn dữ liệu nếu tác giả đã có sách.

- **Acceptance Scenarios (Gherkin):**
1. **Given** Tác giả A chưa được gán cho cuốn sách nào trong cửa hàng, **When** Admin chọn Xóa và nhấn "Đồng ý" ở hộp thoại xác nhận, **Then** Hệ thống gọi API `DELETE /api/app/author/{id}`, xóa thành công và thông báo *"🎉 Xóa tác giả thành công!"*.
2. **Given** Tác giả B đang được gán cho 2 cuốn sách trong cửa hàng, **When** Admin chọn Xóa tác giả B, **Then** Hệ thống chặn lại, hiển thị thông báo lỗi: *"⚠️ Không thể xóa tác giả này vì đang có sách trong cửa hàng! Vui lòng xóa hoặc thay đổi tác giả cho các cuốn sách tương ứng trước."* và dữ liệu tác giả B không bị xóa.

---

## 📐 Data Contract & Mô hình Dữ liệu (Data Model)

### Thực thể Tác giả (`AppAuthors`)
Kế thừa `FullAuditedAggregateRoot<Guid>` (tự động hỗ trợ Soft Delete `IsDeleted` và Audit Logging):

| Trường dữ liệu | Kiểu dữ liệu | Ràng buộc | Diễn giải |
| :--- | :--- | :--- | :--- |
| `Id` | `Guid` | Khóa chính (PK) | Mã định danh duy nhất của tác giả |
| `Name` | `nvarchar(64)` | Not Null, Max 64 | Họ và tên tác giả |
| `BirthDate` | `datetime2` | Not Null | Ngày tháng năm sinh |
| `ShortBio` | `nvarchar(max)` | Nullable | Tiểu sử, giới thiệu quá trình sáng tác |
| `IsDeleted` | `bit` | Default `0` | Cờ xóa mềm (Soft Delete) |
| `DeleterId` | `Guid?` | Nullable | ID người thực hiện xóa |
| `DeletionTime` | `datetime2?` | Nullable | Thời điểm thực hiện xóa |
| `CreationTime` | `datetime2` | Not Null | Thời điểm tạo bản ghi |
| `CreatorId` | `Guid?` | Nullable | ID người tạo bản ghi |

---

## 🔌 API Contracts & Endpoints (`IAuthorAppService`)

| Phương thức | Đường dẫn API | Quyền hạn yêu cầu | Diễn giải |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/app/author/{id}` | `BookStorePermissions.Authors.Default` | Lấy chi tiết tác giả theo ID |
| `GET` | `/api/app/author` | `BookStorePermissions.Authors.Default` | Lấy danh sách tác giả có phân trang |
| `GET` | `/api/app/author/author-lookup` | `BookStorePermissions.Authors.Default` | Lấy danh sách rút gọn cho Dropdown Sách |
| `POST` | `/api/app/author` | `BookStorePermissions.Authors.Create` | Thêm mới tác giả |
| `PUT` | `/api/app/author/{id}` | `BookStorePermissions.Authors.Edit` | Cập nhật thông tin tác giả |
| `DELETE` | `/api/app/author/{id}` | `BookStorePermissions.Authors.Delete` | Xóa tác giả (có kiểm tra ràng buộc sách) |
