# Feature Specification: Live Chat Support (Hỗ Trợ Khách Hàng Trực Tuyến)

**Feature Branch**: `002-live-chat-support`  
**Created**: 2026-09-28 | **Last Clarified**: 2026-09-28  
**Status**: Specified  

**Input**: User description: "Hoàn thiện tính năng Live Chat hỗ trợ khách hàng giữa User và Admin: thanh chat cua khách hàng ở menu, refactor sang Angular Signals, xử lý thông báo tin nhắn mới và kiểm tra đăng nhập."

---

## 📌 Clarifications & Business Decisions

1. **Vị trí truy cập của Khách hàng**: Khách hàng truy cập Live Chat qua mục **"Hỗ trợ trực tuyến"** trên thanh Menu chính (`/chat-support`). Khi đăng nhập với quyền Admin, menu này tự động ẩn và thay bằng menu **"Hỗ trợ khách hàng"** (`/admin/chat`).
2. **Yêu cầu Xác thực (Đăng nhập)**: Tính năng Live Chat giữa Khách hàng và Admin yêu cầu người dùng phải đăng nhập tài khoản. Nếu khách vãng lai (Guest) truy cập `/chat-support`, giao diện hiển thị thông báo thân thiện kèm nút bấm chuyển hướng sang trang Đăng nhập, ngăn chặn triệt để lỗi 401 Unauthorized từ API/SignalR.
3. **Chuẩn Kiến trúc Frontend**: Toàn bộ luồng dữ liệu của cả `CustomerChatComponent` và `AdminChatComponent` được tái cấu trúc hoàn toàn bằng **Angular Signals** (`signal()`, `computed()`), One-Way Data Binding (`[value]` / `(input)`), và cú pháp điều khiển hiện đại (`@if`, `@for (item of items(); track item.id)`). Loại bỏ toàn bộ `*ngIf`, `*ngFor` và two-way binding `[(ngModel)]`.
4. **Thông báo tin nhắn mới & Huy hiệu (Badges)**:
   - **Phía Khách hàng**: Khi có tin nhắn mới từ Admin, nếu khách đang mở trang chat thì tin nhắn tự hiển thị và cuộn xuống dưới cùng; nếu đang ở trang khác, menu "Hỗ trợ" hiển thị chấm đỏ hoặc số lượng tin nhắn chưa đọc.
   - **Phía Admin**: Khi khách nhắn tin, danh sách hội thoại tự động cập nhật tin nhắn mới nhất, đẩy khách hàng đó lên đầu danh sách và tăng số đếm tin chưa đọc (`unreadCount`). Khi Admin bấm vào cuộc trò chuyện, hệ thống tự động gọi API `MarkAsReadAsync` để xóa huy hiệu chưa đọc.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Khách hàng Nhắn tin Hỗ trợ với Quản trị viên (Priority: P1)

Là một Khách hàng (User) đã đăng nhập vào hệ thống Acme BookStore, khi bấm vào mục "Hỗ trợ trực tuyến" trên thanh Menu, tôi muốn trò chuyện trực tiếp với nhân viên quản trị để được tư vấn về sách, đơn hàng và các chính sách khuyến mãi.

**Why this priority**: Đây là kênh giao tiếp hai chiều quan trọng nhất giúp giải đáp thắc mắc, tăng tỷ lệ chuyển đổi đơn hàng và xây dựng niềm tin của khách hàng.

**Independent Test**: Đăng nhập bằng tài khoản Khách hàng (ví dụ: `user`), bấm menu "Hỗ trợ trực tuyến", gửi một tin nhắn chào hỏi. Mở tab trình duyệt thứ 2 đăng nhập bằng tài khoản `admin` ở trang `/admin/chat`, kiểm tra xem Admin có nhận được tin nhắn tức thì qua SignalR hay không, và khi Admin trả lời thì màn hình khách có hiện ngay lập tức không.

**Acceptance Scenarios**:

1. **Given** Khách hàng đã đăng nhập tài khoản, **When** Truy cập menu "Hỗ trợ trực tuyến" (`/chat-support`), **Then** Màn hình tải lịch sử các tin nhắn trước đó giữa khách và Admin, khung chat tự động cuộn xuống tin nhắn mới nhất.
2. **Given** Khách hàng đang ở màn hình chat, **When** Nhập nội dung tin nhắn và nhấn phím Enter (hoặc bấm nút "Gửi"), **Then** Tin nhắn hiển thị ngay lập tức trong bong bóng chat bên phải (màu xanh thương hiệu), ô nhập liệu được làm sạch và thanh cuộn trượt xuống dưới cùng.
3. **Given** Khách hàng đang ở màn hình chat, **When** Admin gửi câu trả lời từ trang Quản trị, **Then** Tin nhắn của Admin xuất hiện ngay lập tức trong bong bóng bên trái (kèm tên Admin và thời gian gửi) mà không cần tải lại trang.

---

### User Story 2 - Quản trị viên Tiếp nhận và Tư vấn Khách hàng (Admin Live Chat) (Priority: P1)

Là Quản trị viên (Admin), tôi muốn có một giao diện bảng điều khiển hội thoại chuyên nghiệp tại `/admin/chat` để theo dõi toàn bộ danh sách khách hàng đang cần tư vấn, xem số tin chưa đọc, và trả lời từng khách hàng theo thời gian thực.

**Why this priority**: Admin cần một công cụ tập trung, nhanh chóng để phản hồi khách hàng kịp thời, không bỏ sót yêu cầu trợ giúp.

**Independent Test**: Đăng nhập với quyền Admin, mở `/admin/chat`. Gửi tin nhắn từ tài khoản khách, kiểm tra danh sách hội thoại bên trái tự động hiển thị khách hàng vừa gửi với huy hiệu số tin chưa đọc (Badge màu đỏ). Chọn vào khách hàng đó, kiểm tra lịch sử hiển thị đầy đủ và badge chưa đọc được xóa.

**Acceptance Scenarios**:

1. **Given** Admin đang mở trang `/admin/chat`, **When** Một khách hàng gửi tin nhắn mới, **Then** Cuộc hội thoại của khách hàng đó tự động nhảy lên vị trí đầu tiên trong danh sách bên trái, cập nhật tin nhắn cuối cùng kèm huy hiệu số tin chưa đọc.
2. **Given** Admin bấm chọn vào một khách hàng trong danh sách hội thoại, **When** Hội thoại được mở, **Then** Khung chat chính tải toàn bộ lịch sử trò chuyện, hệ thống tự động đánh dấu đã đọc (`MarkAsReadAsync`) và xóa số đếm chưa đọc trên thanh danh sách.
3. **Given** Admin nhập nội dung trả lời vào khung chat và gửi, **When** Tin nhắn gửi đi thành công, **Then** Tin nhắn hiển thị bên phải khung chat Admin, đồng thời truyền tới đúng tài khoản khách hàng đó qua SignalR.

---

### User Story 3 - Kiểm tra Đăng nhập & Xử lý Khách vãng lai (Guest) (Priority: P2)

Là một Khách truy cập chưa đăng nhập (Guest), khi tôi bấm vào mục "Hỗ trợ trực tuyến" trên thanh menu, hệ thống cần hướng dẫn tôi đăng nhập thay vì bị màn hình lỗi hoặc gửi tin nhắn thất bại.

**Why this priority**: Tránh lỗi bảo mật 401 Unauthorized, bảo vệ tính toàn vẹn dữ liệu `ChatMessage` và mang lại trải nghiệm mượt mà, chuyên nghiệp cho người dùng.

**Independent Test**: Mở trình duyệt ở chế độ ẩn danh (chưa đăng nhập), click vào menu "Hỗ trợ trực tuyến" (`/chat-support`). Kiểm tra giao diện hiển thị thông báo nhắc nhở đăng nhập rõ ràng, không xuất hiện lỗi đỏ trên Console, và nút "Đăng nhập ngay" dẫn đến trang đăng nhập thành công.

**Acceptance Scenarios**:

1. **Given** Người dùng chưa đăng nhập tài khoản, **When** Truy cập vào đường dẫn `/chat-support`, **Then** Giao diện hiển thị thẻ thông báo: "Vui lòng đăng nhập để bắt đầu trò chuyện với nhân viên hỗ trợ" kèm nút bấm "Đăng nhập ngay".
2. **Given** Người dùng chưa đăng nhập, **When** Màn hình hiển thị, **Then** Hệ thống không thực hiện gọi các API yêu cầu xác thực (`GetMyChatHistoryAsync`, SignalR Hub) nhằm ngăn chặn phát sinh lỗi 401 trên Network tab.
3. **Given** Người dùng bấm vào nút "Đăng nhập ngay", **When** Đăng nhập thành công, **Then** Hệ thống tự động chuyển hướng người dùng quay lại màn hình Chat Hỗ Trợ và tải lịch sử tin nhắn bình thường.

---

### User Story 4 - Refactor Toàn diện sang Angular Signals & One-Way Binding (Priority: P2)

Là Nhà phát triển hệ thống, tôi muốn mã nguồn giao diện Chat tuân thủ 100% bộ quy chuẩn kỹ thuật (Constitution) của Acme BookStore: sử dụng Angular Signals, One-way binding, cấu trúc component phản ứng nhanh, và loại bỏ hoàn toàn các cấu trúc cũ.

**Why this priority**: Tăng tốc độ render, hạn chế trigger Change Detection thừa thãi, đồng bộ phong cách lập trình với toàn bộ dự án (Coupons, Carts, Books).

**Independent Test**: Kiểm tra mã nguồn TypeScript và HTML của `CustomerChatComponent` và `AdminChatComponent`, đảm bảo không còn `[(ngModel)]`, `*ngIf`, `*ngFor`; tất cả trạng thái (`messages`, `conversations`, `selectedUser`, `inputText`, `isLoading`, `isLoggedIn`) đều được quản lý bằng `signal()` và `computed()`.

**Acceptance Scenarios**:

1. **Given** Component `CustomerChatComponent`, **When** Khởi tạo, **Then** Quản lý trạng thái bằng `messages = signal<ChatMessageDto[]>([])`, `inputText = signal<string>('')`, `isLoggedIn = computed(...)`.
2. **Given** Ô nhập liệu tin nhắn, **When** Người dùng gõ phím, **Then** Sử dụng luồng 1 chiều `[value]="inputText()"` và `(input)="inputText.set($any($event.target).value)"` cùng `(keyup.enter)="sendMessage()"`.
3. **Given** Danh sách tin nhắn hiển thị trong HTML, **When** Render, **Then** Sử dụng cú pháp `@for (msg of messages(); track msg.id)` và `@if (messages().length === 0)` chuẩn Angular hiện đại.

---

### Edge Cases

- **Mất kết nối mạng hoặc đứt SignalR**: Khi kết nối mạng bị gián đoạn, `ChatSignalRService` tự động kết nối lại (`withAutomaticReconnect()`). Giao diện hiển thị chỉ báo trạng thái kết nối nhẹ nhàng, không làm mất nội dung đang gõ của người dùng.
- **Tin nhắn rỗng hoặc toàn dấu cách**: Nút "Gửi" bị vô hiệu hóa (`disabled`) nếu `inputText().trim() === ''`. Bấm Enter khi nội dung rỗng sẽ không thực hiện gửi.
- **Nhiều tab Admin cùng mở**: Khi có tin nhắn mới từ khách, sự kiện SignalR gửi vào group `"Admins"` giúp toàn bộ các tab Admin đang mở đều cập nhật đồng thời mà không bị trùng lặp tin nhắn.
- **Cuộn màn hình (Auto-scroll)**: Chỉ tự động cuộn xuống đáy khi có tin nhắn mới hoặc khi vừa mở cuộc trò chuyện; không cưỡng ép cuộn xuống nếu người dùng đang chủ động cuộn lên trên để đọc lại tin nhắn cũ.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI duy trì mục "Hỗ trợ trực tuyến" trên thanh Menu chính cho Khách hàng (`/chat-support`) và ẩn đối với Admin.
- **FR-002**: Hệ thống PHẢI yêu cầu đăng nhập đối với Khách hàng trước khi kích hoạt kết nối SignalR và tải lịch sử chat. Nếu chưa đăng nhập, PHẢI hiển thị giao diện nhắc đăng nhập thân thiện.
- **FR-003**: Khi Admin đăng nhập, menu PHẢI hiển thị "Hỗ trợ khách hàng" (`/admin/chat`) với quyền truy cập tương ứng.
- **FR-004**: Phía Admin, danh sách cuộc trò chuyện PHẢI cập nhật thời gian thực khi có tin nhắn mới đến, tự động sắp xếp khách hàng mới nhất lên trên đầu và hiển thị huy hiệu số tin chưa đọc.
- **FR-005**: Khi Admin chọn một cuộc trò chuyện, hệ thống PHẢI gọi API `MarkAsReadAsync` để reset trạng thái đã đọc của khách hàng đó.
- **FR-006**: Toàn bộ mã nguồn phía Client của cả `CustomerChatComponent` và `AdminChatComponent` PHẢI sử dụng **Angular Signals** (`signal`, `computed`), luồng dữ liệu một chiều (One-Way Data Binding) và cú pháp `@if`, `@for`. Tuyệt đối không dùng `[(ngModel)]`, `*ngIf`, `*ngFor`.
- **FR-007**: Hệ thống PHẢI đảm bảo tin nhắn gửi đi và nhận về hiển thị tức thì qua SignalR Hub `/signalr-hubs/chat` mà không yêu cầu F5 tải lại trang.
- **FR-008**: Toàn bộ thông báo, nhãn hiển thị và giao diện PHẢI bằng Tiếng Việt 100%.

---

## Success Criteria *(mandatory)*

- **SC-001**: Khách hàng đã đăng nhập gửi tin nhắn từ menu "Hỗ trợ trực tuyến", Admin nhận được tin nhắn tức thì trên màn hình `/admin/chat` trong vòng dưới 500ms.
- **SC-002**: Admin phản hồi tin nhắn, màn hình Khách hàng cập nhật hiển thị ngay lập tức trong vòng dưới 500ms.
- **SC-003**: Khách vãng lai chưa đăng nhập truy cập `/chat-support` không xuất hiện bất kỳ lỗi 401 nào trên Console, hiển thị nút "Đăng nhập ngay" rõ ràng.
- **SC-004**: 100% template HTML và component TypeScript của tính năng Chat đạt chuẩn Angular Signals & One-Way Binding, biên dịch Angular hoàn tất 0 cảnh báo/0 lỗi.
