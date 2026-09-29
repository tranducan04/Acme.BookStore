# Acme.BookStore Constitution

Dự án **Acme.BookStore** tuân thủ các nguyên tắc kiến trúc cốt lõi dưới đây cho toàn bộ quá trình phát triển tính năng bằng SpecKit (SDD - Specification-Driven Development). Mọi tài liệu đặc tả (`spec.md`), kế hoạch kỹ thuật (`plan.md`), danh sách công việc (`tasks.md`) và mã nguồn sinh ra (`implement`) bắt buộc phải tuân theo các điều khoản này.

---

## 🏛️ Core Principles (Nguyên tắc cốt lõi)

### I. Backend Service Contracts: Direct `IApplicationService` (NON-NEGOTIABLE)
- **Tuyệt đối không dùng `ICrudAppService<...>`**: Mọi interface ở tầng `Application.Contracts` phải kế thừa trực tiếp `IApplicationService`.
- **Khai báo tường minh (Explicit Contract)**: Mọi phương thức CRUD hoặc nghiệp vụ đều phải khai báo rõ ràng tham số và kiểu trả về (ví dụ: `Task<TDto> GetAsync(Guid id)`, `Task<PagedResultDto<TDto>> GetListAsync(PagedAndSortedResultRequestDto input)`, `Task<TDto> CreateAsync(CreateUpdateDto input)`, `Task<TDto> UpdateAsync(Guid id, CreateUpdateDto input)`, `Task DeleteAsync(Guid id)`).
- **Kiểm soát API Surface**: Không để lộ các API thừa thãi không dùng tới; DTOs đầu vào / đầu ra phải được thiết kế riêng biệt và có validation chặt chẽ (`[Required]`, `[StringLength]`).
- **Implementation**: Ở tầng `Application`, class triển khai kế thừa `ApplicationService` (hoặc `BookStoreAppService`) hoặc `CrudAppService<...>` tùy nhu cầu nhưng contract bên ngoài (`Application.Contracts`) chỉ được phơi bày `IApplicationService`.

### II. Frontend Reactivity: Angular Signals & One-Way Data Flow (NON-NEGOTIABLE)
- **Tư duy Signal-First**: Mọi trạng thái giao diện (UI State), dữ liệu danh sách, cờ loading, bộ lọc, modal... bắt buộc phải quản lý bằng **Angular Signals** (`signal()`, `computed()`, `effect()`).
- **One-Way Binding**: Sử dụng luồng dữ liệu một chiều (`[value]="item.name"` và `(input)="onInputChange($event)"`, hoặc cập nhật trực tiếp qua signal: `item.set(...)`). Hạn chế tối đa two-way binding `[(ngModel)]` phức tạp.
- **Computed State**: Các trạng thái phái sinh (lọc danh sách, tính tổng tiền giỏ hàng, đếm số lượng) phải sử dụng `computed()`, không viết logic tính toán lại trong template.
- **Không dùng thư viện Modal/JS ngoài**: Loại bỏ hoàn toàn Bootstrap JS / jQuery modal. Trạng thái Modal được kiểm soát 100% bằng Signal (`isModalOpen = signal(false)`, `openModal()`, `closeModal()`) kết hợp hiệu ứng CSS/Angular Animation.

### III. Modern Angular Standards
- **Standalone Components**: 100% components là standalone (`standalone: true`). Không sử dụng `NgModule` cho các tính năng mới.
- **Dependency Injection hiện đại**: Sử dụng hàm `inject()` thay cho constructor injection truyền thống (ví dụ: `private bookStoreService = inject(BookStoreService);`).
- **Modern Control Flow**: Bắt buộc sử dụng cú pháp mới `@if`, `@else`, `@for (item of items(); track item.id)`, `@switch`, không dùng directives cũ `*ngIf`, `*ngFor`.
- **Xử lý Async RxJS**: Chuyển đổi Observable từ ABP Proxy sang Promise thông qua `firstValueFrom()` trong các hàm `async/await` để code đồng bộ, sạch sẽ và dễ bắt lỗi `try/catch`.

### IV. Clean Architecture & Domain-Driven Design (ABP Framework)
- **Phân tầng nghiêm ngặt**:
  - `Domain.Shared`: Chứa Enums, hằng số và chuỗi đa ngôn ngữ (`vi.json`).
  - `Domain`: Chứa Aggregate Roots / Entities, Domain Services và Repository Interfaces đặc thù.
  - `Application.Contracts`: Chứa DTOs, Permissions và Interfaces kế thừa `IApplicationService`.
  - `Application`: Chứa Application Services xử lý nghiệp vụ, tự động generate REST API qua ABP Dynamic Web API.
  - `EntityFrameworkCore`: Cấu hình Fluent API, DbContext và EF Core Migrations.
  - `angular/src/app/proxy`: Chứa TypeScript Services & Models được sinh tự động bởi ABP CLI (`abp generate-proxy -t ng`).

### V. Localization & Chuẩn Tiếng Việt
- Hệ thống hỗ trợ thuần Việt 100%: Toàn bộ thông báo lỗi nghiệp vụ (`UserFriendlyException`), nhãn giao diện, placeholder đều sử dụng Tiếng Việt.
- Đơn vị tiền tệ: Định dạng chuẩn Việt Nam Đồng (`₫` / `VNĐ`).

---

## 🔒 Governance & Enforcement

1. **Tuân thủ tuyệt đối**: Mọi lệnh SpecKit (`/speckit.specify`, `/speckit.plan`, `/speckit.tasks`, `/speckit.implement`) đều phải đối chiếu với các nguyên tắc trên trước khi tạo spec hoặc sinh code.
2. **Review Gate**: Nếu spec hoặc code vi phạm (như dùng `ICrudAppService<...>` hoặc dùng `*ngIf`/`[(ngModel)]` không cần thiết), hệ thống phải tự động cảnh báo và điều chỉnh lại theo đúng Hiến pháp.

**Version**: 1.0.0 | **Ratified**: 2026-09-28 | **Project**: Acme.BookStore
