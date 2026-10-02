# Tasks: Live Chat Support (Hỗ Trợ Khách Hàng Trực Tuyến)

**Input**: Design documents from `specs/002-live-chat-support/` (`spec.md`, `plan.md`, `research.md`, `quickstart.md`)  
**Constitution**: Tuân thủ trực tiếp `IApplicationService` và `Angular Signals & One-Way Binding`  
**Status**: In Progress (`/speckit.implement` - Core Implementation Complete)  

---

## 📋 Danh sách Task triển khai theo từng giai đoạn

### 🔷 Giai đoạn 1: Tinh chỉnh Backend & Xác thực Định danh (Backend Hardening)
*Mục đích: Đảm bảo API tìm Admin ID và SignalR Hub broadcast chuẩn xác trong mọi ngữ cảnh*

- [x] **T001** [P] Tinh chỉnh `ChatAppService.GetAdminIdAsync()` tại `aspnet-core/src/Acme.BookStore.Application/Chats/ChatAppService.cs`: Đảm bảo tìm đúng tài khoản quản trị viên trong database kể cả môi trường Host hay Tenant, tránh trường hợp trả về `Guid.Empty`.
- [x] **T002** [P] Kiểm tra logic gửi tin nhắn trong `ChatHub.cs` tại `aspnet-core/src/Acme.BookStore.HttpApi.Host/Hubs/ChatHub.cs`: Sử dụng `Clients.GroupExcept("Admins", Context.ConnectionId)` để tránh gửi đúp sự kiện cho người gửi và đảm bảo broadcast chính xác.

---

### 🔷 Giai đoạn 2: Cải tiến SignalR Service (Signal-Friendly Service)
*Mục đích: Tạo cầu nối SignalR reactive, quản lý trạng thái kết nối bằng Signals*

- [x] **T003** Cập nhật `ChatSignalRService` tại `angular/src/app/features/chat/chat-signalr.service.ts`:
  - Bổ sung `isConnected = signal<boolean>(false)` để các component dễ dàng bind trạng thái kết nối.
  - Cập nhật trạng thái `isConnected.set(true/false)` khi connect, disconnect hoặc reconnect.
  - Giữ cơ chế Bearer token qua `accessTokenFactory` và phát sự kiện `messageReceived$`.

---

### 🔷 Giai đoạn 3: Refactor Khách hàng `CustomerChatComponent` (Signals & Auth Check)
*Mục đích: Màn hình chat thân thiện, kiểm tra đăng nhập triệt để lỗi 401, 100% Angular Signals*

- [x] **T004** Refactor `CustomerChatComponent` tại `angular/src/app/features/user/chat-support/customer-chat.component.ts`:
  - Khởi tạo các trạng thái bằng Signals:
    - `messages = signal<ChatMessageDto[]>([])`
    - `inputText = signal<string>('')`
    - `isLoading = signal<boolean>(false)`
    - `currentUserId = signal<string>('')`
    - `isLoggedIn = computed(() => !!this.currentUserId())`
  - Kiểm tra đăng nhập trong `ngOnInit()`: Nếu `!isLoggedIn()`, KHÔNG gọi `getAdminId()` và KHÔNG start SignalR, tránh triệt để lỗi 401.
  - Nếu đã đăng nhập: Tự động kết nối SignalR, load lịch sử tin nhắn và lắng nghe tin nhắn mới vào `messages()`.
  - Viết phương thức `send()` và `scrollToBottom()` với Signals và One-way binding.
  - Bổ sung phương thức `login()` kích hoạt `OAuthService.initLoginFlow()`.
- [x] **T005** Tái cấu trúc template `customer-chat.component.html`:
  - Áp dụng cấu trúc `@if (!isLoggedIn())`: Hiển thị thẻ card nhắc nhở đăng nhập với icon tai nghe hỗ trợ và nút "Đăng nhập ngay".
  - Áp dụng `@if (isLoggedIn())`: Hiển thị khung chat với danh sách tin nhắn `@for (msg of messages(); track msg.id)`.
  - Chuyển ô nhập liệu sang One-Way Binding: `[value]="inputText()"`, `(input)="inputText.set($any($event.target).value)"`, `(keyup.enter)="send()"`.
  - Loại bỏ hoàn toàn `[(ngModel)]`, `*ngIf`, `*ngFor`.
- [x] **T006** Tối ưu phong cách giao diện `customer-chat.component.scss`:
  - Khung chat bo góc mềm mại, đổ bóng nhẹ.
  - Bong bóng tin nhắn người dùng (xanh dương hiện đại) và tin nhắn Admin (trắng viền xám).
  - Trạng thái chấm xanh hoạt động "Đang trực tuyến" và nhãn thời gian tin nhắn rõ ràng.

---

### 🔷 Giai đoạn 4: Refactor Quản trị viên `AdminChatComponent` (Signals & Unread Badges)
*Mục đích: Bảng điều khiển chat thời gian thực cho Admin với Signals và đếm tin chưa đọc*

- [x] **T007** Refactor `AdminChatComponent` tại `angular/src/app/features/admin/AdminChat/admin-chat.component.ts`:
  - Quản lý trạng thái hoàn toàn bằng Signals:
    - `conversations = signal<ConversationDto[]>([])`
    - `selectedUser = signal<ConversationDto | null>(null)`
    - `messages = signal<ChatMessageDto[]>([])`
    - `inputText = signal<string>('')`
    - `isLoading = signal<boolean>(false)`
  - Lắng nghe SignalR: Khi có tin nhắn mới từ khách, cập nhật danh sách `conversations()`: đưa người gửi lên đầu, cập nhật tin nhắn cuối cùng và tăng `unreadCount` nếu Admin đang không mở hội thoại đó.
  - Khi Admin chọn khách hàng (`selectConversation`): Tải lịch sử tin nhắn vào `messages()`, gọi `markAsRead()` để xóa badge unread.
  - Triển khai `send()` với Signals và tự động cuộn xuống dưới cùng.
- [x] **T008** Tái cấu trúc template `admin-chat.component.html`:
  - Sử dụng cú pháp `@if`, `@for (conv of conversations(); track conv.userId)`.
  - Hiển thị badge số tin chưa đọc màu đỏ `bg-danger` khi `conv.unreadCount > 0`.
  - Ô nhập câu trả lời tư vấn dùng One-Way Binding: `[value]="inputText()"`, `(input)="inputText.set($any($event.target).value)"`.
  - Loại bỏ toàn bộ `[(ngModel)]`, `*ngIf`, `*ngFor`.
- [x] **T009** Cải tiến giao diện `admin-chat.component.scss`:
  - Bố cục 2 cột (Cột danh sách khách hàng bên trái, Cột khung chat bên phải) cân đối.
  - Hiệu ứng active rõ ràng khi chọn cuộc hội thoại.

---

### 🔷 Giai đoạn 5: Cấu hình Menu & Navigation
*Mục đích: Đảm bảo điều hướng chính xác giữa Khách hàng và Quản trị viên*

- [x] **T010** Rà soát `route.provider.ts` và `app.routes.ts`:
  - Menu "Hỗ trợ trực tuyến" (`/chat-support`) hiển thị cho Khách hàng và ẩn đối với Admin.
  - Menu "Tư vấn Khách hàng" (`/admin/chat`) chỉ hiển thị khi có quyền `BookStore.Books.Create` (Admin).

---

### 🔷 Giai đoạn 6: Kiểm thử E2E & Nghiệm thu
*Mục đích: Xác thực hoạt động toàn chu trình theo quickstart.md*

- [x] **T011** Kiểm thử trường hợp Khách vãng lai: API `GetAdminIdAsync` hoạt động công khai trả về Admin ID chuẩn xác mà không ném lỗi 401, giao diện chat-support hiển thị thẻ hướng dẫn đăng nhập khi chưa login.
- [x] **T012** Kiểm thử hệ thống SignalR: Backend `ChatHub` broadcast GroupExcept tránh đúp sự kiện, `ChatSignalRService` kết nối an toàn với token factory, build frontend và backend thành công 0 lỗi.
