# Feature Specification: Book Management & Catalog (Quản Lý Sách & Danh Mục Sách)

**Feature Branch**: `003-book-management`  
**Created**: 2026-09-29 | **Last Clarified**: 2026-09-29  
**Status**: Clarified & Implemented (Reverse Specification)  
**Tài liệu liên quan**:
- Entity Backend: `aspnet-core/src/Acme.BookStore.Domain/Books/Book.cs`
- Contracts & DTOs: `aspnet-core/src/Acme.BookStore.Application.Contracts/Books/`
- Service Implementation: `aspnet-core/src/Acme.BookStore.Application/Books/BookAppService.cs`
- Giao diện Admin/Store: `angular/src/app/features/admin/Books/`

---

## 📌 Tổng quan Nghiệp vụ (Business Overview)

Chức năng **Quản lý Sách (Book Management)** là mô-đun hạt nhân (Core Module) của hệ thống thương mại điện tử `Acme.BookStore`. Chức năng đáp ứng 2 nhóm đối tượng người dùng chính:
1. **Quản trị viên (Admin):** Toàn quyền kiểm soát danh mục sách (CRUD), quản lý giá bán, giá gốc (khuyến mãi Flash Sale), quản lý số lượng tồn kho (Stock), liên kết Sách với Tác giả (Author), Nhà xuất bản (Publisher), Danh mục (Category) và Giới hạn độ tuổi (Age Limit).
2. **Khách hàng (Customer / Storefront User):** Tìm kiếm và tra cứu sách đa tiêu chí (theo tên, thể loại, tác giả, mức giá, độ tuổi), xem chi tiết thông tin sách, đánh giá/bình luận sao (Reviews & Ratings), thêm sách vào Danh sách yêu thích (Wishlist) và Giỏ hàng (Cart).

---

## 📌 Clarifications & Business Decisions (Quy tắc Nghiệp vụ)

1. **Ràng buộc liên kết dữ liệu (Foreign Keys & Relations)**:
   - Sách bắt buộc phải chọn Tác giả (`AuthorId`), Nhà xuất bản (`PublisherId`) và Danh mục (`CategoryId`).
   - Khi xóa Sách, các liên kết Tác giả và NXB được bảo toàn (không xóa Tác giả/NXB).
2. **Quy tắc hiển thị giá và khuyến mãi (Pricing & Flash Sale)**:
   - `Price`: Giá bán thực tế của cuốn sách (VNĐ).
   - `OriginalPrice`: Giá gốc trước khi giảm (tùy chọn). Nếu `OriginalPrice > Price`, giao diện hiển thị badge giảm giá % và gạch ngang giá gốc.
3. **Quản lý kho hàng (Stock Management)**:
   - `StockCount`: Mặc định khởi tạo là 50 hoặc 100 cuốn.
   - Khi `StockCount <= 0`, sách được đánh dấu là "Hết hàng" (Out of Stock), khách hàng không thể thêm vào Giỏ hàng.
4. **Giới hạn độ tuổi (Age Limit)**:
   - Mỗi cuốn sách có chỉ số `AgeLimit` (ví dụ: 0 = Mọi lứa tuổi, 13+, 16+, 18+). Giao diện có bộ lọc sách theo độ tuổi phù hợp.
5. **Hệ thống đánh giá & yêu thích tích hợp (Rating & Wishlist)**:
   - Khách hàng đã đăng nhập có thể đánh giá từ 1 đến 5 sao kèm bình luận cho từng cuốn sách.
   - Điểm đánh giá trung bình (`AverageRating`) và tổng số đánh giá (`ReviewCount`) được tự động tổng hợp để hiển thị trên thẻ sách.

---

## User Scenarios & Testing (Kịch bản Người dùng & Kiểm thử)

### User Story 1 - Khách hàng Tìm kiếm, Lọc và Xem Danh mục Sách (Priority: P1)

Là một **Khách hàng** ghé thăm website, tôi muốn tìm kiếm theo từ khóa, lọc theo thể loại/độ tuổi/giá và xem danh sách sách có phân trang mượt mà để dễ dàng tìm cuốn sách muốn mua.

- **Why this priority:** Trải nghiệm duyệt danh mục là bước đầu tiên quyết định việc khách hàng tìm thấy sản phẩm và đặt hàng.
- **Independent Test:** Vào màn hình duyệt sách, gõ từ khóa vào ô tìm kiếm, chọn lọc theo thể loại "Phiêu lưu" hoặc lọc theo độ tuổi "16+", chọn sắp xếp "Giá tăng dần", kiểm tra kết quả danh sách hiển thị đúng.

**Acceptance Scenarios (Gherkin):**
1. **Given** Người dùng ở màn hình danh mục sách, **When** Nhập từ khóa "Harry Potter" vào thanh tìm kiếm, **Then** Danh sách ngay lập tức lọc và chỉ hiển thị các cuốn sách có chứa tên "Harry Potter".
2. **Given** Danh mục có nhiều cuốn sách thuộc các thể loại khác nhau, **When** Người dùng chọn thể loại "Kinh dị", **Then** Chỉ những cuốn sách có `Type == Horror` hiển thị trên màn hình.
3. **Given** Danh mục sách có tổng cộng 25 cuốn sách, kích thước phân trang là 8 sách/trang, **When** Người dùng bấm sang Trang 2, **Then** Hệ thống hiển thị 8 cuốn sách tiếp theo (từ cuốn 9 đến cuốn 16) mà không cần tải lại toàn bộ trang web.
4. **Given** Một cuốn sách có `StockCount = 0`, **When** Người dùng xem thẻ sách, **Then** Nút "Thêm vào giỏ" bị vô hiệu hóa (disabled) và hiển thị nhãn "Hết hàng".

---

### User Story 2 - Quản trị viên Thêm mới & Cập nhật Sách (Priority: P1)

Là một **Quản trị viên (Admin)** có quyền `BookStorePermissions.Books.Create` và `Edit`, tôi muốn thêm mới một cuốn sách hoặc cập nhật thông tin sách (tên, giá, ảnh bìa, tác giả, danh mục, tồn kho) để duy trì kho sách chính xác.

- **Why this priority:** Admin phải cập nhật được hàng hóa mới lên hệ thống thì cửa hàng mới có sản phẩm kinh doanh.
- **Independent Test:** Đăng nhập tài khoản Admin, bấm "Thêm sách mới", nhập form hợp lệ, ấn Lưu. Kiểm tra sách mới xuất hiện trong cơ sở dữ liệu và hiển thị trên giao diện.

**Acceptance Scenarios (Gherkin):**
1. **Given** Admin mở Form "Thêm sách mới", **When** Điền đầy đủ thông tin: Tên "Lược sử thời gian", Giá 150,000₫, Tồn kho 50, chọn Tác giả, NXB, Danh mục và nhấn "Lưu", **Then** Hệ thống gọi API `POST /api/app/book`, tạo mới bản ghi thành công và hiển thị thông báo thành công.
2. **Given** Admin để trống trường Tên sách hoặc Giá bán bằng 0, **When** Nhấn nút "Lưu", **Then** Hệ thống chặn gửi form, hiển thị thông báo lỗi kiểm thực: *"Vui lòng nhập tên sách"* hoặc *"Giá bán phải lớn hơn 0"*.
3. **Given** Một cuốn sách đang có giá 200,000₫, **When** Admin cập nhật giá bán thành 160,000₫ và đặt Giá gốc `OriginalPrice = 200,000₫`, **Then** Hệ thống lưu thành công và hiển thị nhãn giảm giá 20% trên giao diện.

---

### User Story 3 - Quản trị viên Xóa Sách (Priority: P2)

Là một **Quản trị viên** có quyền `BookStorePermissions.Books.Delete`, tôi muốn xóa một cuốn sách không còn kinh doanh khỏi hệ thống.

- **Why this priority:** Đảm bảo dữ liệu danh mục luôn sạch, loại bỏ các sách đã ngừng xuất bản hoặc tạo thử nghiệm.
- **Independent Test:** Chọn 1 cuốn sách bất kỳ, bấm nút "Xóa", xác nhận hộp thoại cảnh báo và kiểm tra xem sách đó biến mất khỏi danh sách.

**Acceptance Scenarios (Gherkin):**
1. **Given** Admin bấm nút icon thùng rác (Delete) tại dòng cuốn sách, **When** Hộp thoại xác nhận hiển thị và Admin chọn "Đồng ý", **Then** Hệ thống gọi API `DELETE /api/app/book/{id}`, xóa sách và cập nhật lại danh sách trên màn hình.

---

### User Story 4 - Đánh giá Sách & Thêm vào Yêu thích (Priority: P2)

Là một **Khách hàng đã đăng nhập**, tôi muốn gửi đánh giá sao (1-5 sao) kèm nhận xét cho cuốn sách và lưu sách vào Danh sách yêu thích (Wishlist) để theo dõi.

- **Why this priority:** Tăng tính tương tác xã hội (Social Proof) và nâng cao trải nghiệm mua sắm của khách hàng.
- **Acceptance Scenarios (Gherkin):**
1. **Given** Khách hàng đã đăng nhập đang xem sách "Nhà Giả Kim", **When** Chọn đánh giá 5 sao, viết nhận xét "Sách rất hay" và bấm "Gửi đánh giá", **Then** Hệ thống lưu đánh giá, cập nhật điểm đánh giá trung bình hiển thị trên trang.
2. **Given** Khách hàng xem danh sách sách, **When** Bấm vào biểu tượng trái tim (Wishlist), **Then** Cuốn sách được thêm vào danh sách yêu thích và icon chuyển sang màu đỏ.

---

## 📐 Data Contract & Mô hình Dữ liệu (Data Model)

### 1. Thực thể Sách (`AppBooks`)
Kế thừa `AuditedAggregateRoot<Guid>`, `IMultiTenant`:

| Trường dữ liệu | Kiểu dữ liệu | Ràng buộc | Diễn giải |
| :--- | :--- | :--- | :--- |
| `Id` | `Guid` | Khóa chính (PK) | Mã định danh duy nhất |
| `Name` | `nvarchar(128)` | Not Null, Max 128 | Tên cuốn sách |
| `Type` | `int` (Enum) | Not Null | Thể loại sách (`BookType`) |
| `PublishDate` | `datetime2` | Not Null | Ngày xuất bản |
| `Price` | `real / float` | Not Null, > 0 | Giá bán thực tế (VNĐ) |
| `OriginalPrice`| `real / float` | Nullable | Giá gốc trước giảm (Flash Sale) |
| `StockCount` | `int` | Not Null, Mặc định 50 | Số lượng tồn kho |
| `CoverImage` | `nvarchar(max)` | Nullable | Đường dẫn URL ảnh bìa sách |
| `AuthorId` | `Guid?` | FK -> `AppAuthors` | Mã định danh tác giả |
| `PublisherId` | `Guid?` | FK -> `AppPublishers` | Mã định danh nhà xuất bản |
| `CategoryId` | `Guid?` | FK -> `AppCategories` | Mã định danh danh mục sách |
| `AgeLimit` | `int` | Not Null, Mặc định 0 | Giới hạn độ tuổi độc giả |
| `TenantId` | `Guid?` | Nullable | Mã định danh Multi-tenancy |

### 2. Danh mục Thể loại Sách (`BookType` Enum)
- `Undefined = 0`: Chưa xác định
- `Adventure = 1`: Phiêu lưu
- `Biography = 2`: Tiểu sử
- `Dystopia = 3`: Phản địa đàng
- `Fantastic = 4`: Kỳ ảo / Viễn tưởng
- `Horror = 5`: Kinh dị
- `Science = 6`: Khoa học
- `ScienceFiction = 7`: Khoa học viễn tưởng
- `Poetry = 8`: Thơ ca

---

## 🔌 API Contracts (`IBookAppService`)

- `GET /api/app/book/{id}`: Lấy chi tiết sách (tự động LINQ Join lấy `AuthorName`, `PublisherName`, `CategoryName`).
- `GET /api/app/book?skipCount={}&maxResultCount={}`: Lấy danh sách sách có phân trang và sắp xếp.
- `POST /api/app/book`: Thêm sách mới (Yêu cầu quyền `BookStorePermissions.Books.Create`).
- `PUT /api/app/book/{id}`: Cập nhật sách (Yêu cầu quyền `BookStorePermissions.Books.Edit`).
- `DELETE /api/app/book/{id}`: Xóa sách (Yêu cầu quyền `BookStorePermissions.Books.Delete`).
