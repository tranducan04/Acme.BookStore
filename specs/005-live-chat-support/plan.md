# Implementation Plan: Live Chat Support (Hỗ Trợ Khách Hàng Trực Tuyến)

**Branch**: `002-live-chat-support` | **Date**: 2026-09-28 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/002-live-chat-support/spec.md`

---

## Summary

Nâng cấp và hoàn thiện toàn diện tính năng Live Chat Hỗ trợ trực tuyến giữa Khách hàng (User) và Quản trị viên (Admin) cho nền tảng Acme.BookStore:
- **Khách hàng (User)**: Truy cập qua menu "Hỗ trợ trực tuyến" (`/chat-support`). Được kiểm tra trạng thái đăng nhập rõ ràng (nếu chưa đăng nhập sẽ hiển thị màn hình hướng dẫn và nút "Đăng nhập ngay", ngăn chặn triệt để lỗi 401). Tự động kết nối SignalR Hub, tải lịch sử trò chuyện và nhắn tin hai chiều thời gian thực với Admin.
- **Quản trị viên (Admin)**: Quản lý tập trung tại `/admin/chat`. Danh sách hội thoại cập nhật thời gian thực khi có khách nhắn tin mới, tự động đưa khách hàng mới nhất lên đầu danh sách và hiển thị huy hiệu tin chưa đọc (Unread badge). Khi Admin click chọn khách hàng, hệ thống tự động tải tin nhắn và đánh dấu đã đọc (`MarkAsReadAsync`).
- **Kiến trúc Hiện đại (Signals & One-Way Binding)**: Tái cấu trúc 100% hai component `CustomerChatComponent` và `AdminChatComponent` sang Angular Signals (`signal()`, `computed()`), One-Way Data Binding (`[value]` / `(input)` / `(keyup.enter)`), và cú pháp điều khiển hiện đại (`@if`, `@for (item of items(); track item.id)`). Loại bỏ hoàn toàn `[(ngModel)]`, `*ngIf`, `*ngFor`.
- **Độ tin cậy Real-time**: Cải thiện `ChatSignalRService` hỗ trợ theo dõi trạng thái kết nối bằng Signals, tự động kết nối lại (`withAutomaticReconnect()`) và token injection an toàn.

---

## Technical Context

**Language/Version**: C# 12 / .NET 10 (Backend) & TypeScript 5+ / Angular 17+ (Frontend)  
**Primary Dependencies**: ABP Framework 9+, Microsoft SignalR, Angular Signals, RxJS  
**Storage**: Microsoft SQL Server (bảng `AppChatMessages`)  
**Target Platform**: Web Responsive (Desktop, Tablet, Mobile)  
**Project Type**: Clean Architecture Web E-Commerce Application  
**Performance Goals**: Truyền tải tin nhắn SignalR < 500ms, chuyển đổi hội thoại mượt mà không re-render toàn trang  
**Constraints**: 
- Tiếng Việt 100% trong toàn bộ thông báo nghiệp vụ và nhãn UI.
- Tuân thủ bộ quy chuẩn Hiến pháp dự án (Constitution): Signals, One-way binding, Direct `IApplicationService`.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Nguyên tắc Hiến pháp | Trạng thái | Đánh giá tuân thủ |
| :--- | :---: | :--- |
| **I. Direct `IApplicationService`** | ✅ PASS | `IChatAppService : IApplicationService` kế thừa trực tiếp, tuyệt đối không dùng `ICrudAppService<...>`. Đã có các phương thức tường minh: `GetMyChatHistoryAsync`, `GetAdminConversationListAsync`, `MarkAsReadAsync`, `GetAdminIdAsync`. |
| **II. Angular Signals & One-Way Binding** | ✅ PASS | Quản lý toàn bộ state (`messages`, `conversations`, `selectedUser`, `inputText`, `isLoggedIn`, `connectionStatus`) bằng `signal()` và `computed()`. Dữ liệu nhập vào dùng `[value]="inputText()"` và `(input)="inputText.set($any($event.target).value)"`. |
| **III. Modern Angular Standards** | ✅ PASS | `standalone: true`, `inject()`, modern control flow `@if`, `@for`, tự động hủy subscription qua `takeUntilDestroyed()` / `DestroyRef`. |
| **IV. Clean Architecture (ABP)** | ✅ PASS | Tách biệt Domain (`ChatMessage`) -> Contracts (`IChatAppService`, DTOs) -> Application (`ChatAppService`) -> Host (`ChatHub`, `AbpUserIdProvider`) -> Angular Proxy. |
| **V. Localization & Vietnamese Standard** | ✅ PASS | 100% nhãn giao diện, thông báo chào mừng, trạng thái đăng nhập hiển thị bằng Tiếng Việt chuẩn. |

---

## Project Structure

### Documentation (this feature)

```text
specs/002-live-chat-support/
├── spec.md                  # Tài liệu đặc tả yêu cầu nghiệp vụ
├── checklists/
│   └── requirements.md      # Checklist chất lượng spec
├── plan.md                  # Kế hoạch kỹ thuật tổng thể (file này)
├── research.md              # Phase 0: Phân tích kiến trúc SignalR & State flow
└── quickstart.md            # Phase 1: Hướng dẫn kiểm thử tương tác hai chiều
```

### Source Code Files to Update / Refactor

```text
angular/src/app/
├── features/
│   ├── chat/
│   │   └── chat-signalr.service.ts          # Thêm Signal trạng thái kết nối, tối ưu listener
│   ├── user/
│   │   └── chat-support/
│   │       ├── customer-chat.component.ts   # Refactor 100% sang Signals, Auth Check
│   │       ├── customer-chat.component.html # Cú pháp @if, @for, One-way binding, Empty/Guest state
│   │       └── customer-chat.component.scss # Giao diện hiện đại, bong bóng chat responsive
│   └── admin/
│       └── AdminChat/
│           ├── admin-chat.component.ts      # Refactor 100% sang Signals, Unread Badge reactive
│           ├── admin-chat.component.html    # Cú pháp @if, @for, One-way binding, layout 2 cột
│           └── admin-chat.component.scss    # Hiệu ứng hover, badge đỏ, thanh cuộn mượt
├── route.provider.ts                        # Đảm bảo hiển thị đúng menu cho Customer vs Admin
└── app.routes.ts                            # Route định tuyến /chat-support và /admin/chat

aspnet-core/src/
├── Acme.BookStore.Application/
│   └── Chats/
│       └── ChatAppService.cs                # Kiểm tra xử lý GetAdminIdAsync, phân quyền an toàn
└── Acme.BookStore.HttpApi.Host/
    └── Hubs/
        └── ChatHub.cs                       # Đảm bảo kết nối Admin group và broadcast chính xác
```

---

## Implementation Phases

### Phase 1: Kiểm tra Backend & Khắc phục rủi ro định danh (Backend Validation)
- Đảm bảo `GetAdminIdAsync()` trong `ChatAppService.cs` luôn trả về đúng Admin ID ngay cả khi người dùng thuộc tenant hoặc host.
- Xác thực `ChatHub.cs`: Khách gửi tin nhắn, Hub gửi đồng thời cho Caller, Receiver và Group `"Admins"`. Đảm bảo người dùng trong role `admin` luôn được add vào Group `"Admins"`.

### Phase 2: Cải tiến `ChatSignalRService` (Signal-friendly Service)
- Bổ sung `isConnected = signal<boolean>(false)` để các component dễ dàng lắng nghe trạng thái kết nối.
- Giữ logic `accessTokenFactory` từ `OAuthService` để truyền Bearer token chuẩn cho SignalR WebSocket.

### Phase 3: Refactor `CustomerChatComponent` (Phía Khách hàng)
- Kiểm tra trạng thái đăng nhập qua `ConfigStateService` hoặc `OAuthService`:
  - **Nếu chưa đăng nhập**: `isLoggedIn = computed(() => !!this.currentUserId())`. Hiển thị thẻ thông báo đẹp mắt: "Vui lòng đăng nhập để bắt đầu trò chuyện với nhân viên hỗ trợ" kèm nút bấm "Đăng nhập ngay". Không gọi API `getMyChatHistory` hoặc start SignalR.
  - **Nếu đã đăng nhập**: Khởi chạy SignalR, lấy Admin ID, load lịch sử tin nhắn vào `messages = signal<ChatMessageDto[]>([])`.
- Áp dụng One-way binding: `inputText = signal('')`, `[value]="inputText()"`, `(input)="inputText.set($any($event.target).value)"`, `(keyup.enter)="send()"`.
- Áp dụng cú pháp `@if`, `@for (msg of messages(); track msg.id)` và hiệu ứng tự động cuộn xuống dưới cùng.

### Phase 4: Refactor `AdminChatComponent` (Phía Quản trị viên)
- Chuyển đổi toàn bộ trạng thái sang Signals:
  - `conversations = signal<ConversationDto[]>([])`
  - `selectedUser = signal<ConversationDto | null>(null)`
  - `messages = signal<ChatMessageDto[]>([])`
  - `inputText = signal<string>('')`
- Xử lý sự kiện tin nhắn mới từ SignalR:
  - Nếu tin nhắn thuộc về cuộc hội thoại đang mở (`selectedUser`), append vào `messages()` và tự động cuộn xuống.
  - Cập nhật tức thì `conversations()`: đưa người gửi lên đầu danh sách, cập nhật tin nhắn cuối cùng (`lastMessage`), tăng `unreadCount` nếu không phải hội thoại đang mở.
- Khi chọn một hội thoại: gọi `markAsRead()` để xóa badge unread.
- Áp dụng cú pháp `@if`, `@for`, One-way binding 100%.

### Phase 5: Tinh chỉnh Giao diện (CSS/SCSS) & Kiểm thử Trực quan
- Tối ưu giao diện khung chat phía Khách hàng: bong bóng xanh gradient, thời gian tin nhắn, trạng thái online của nhân viên.
- Tối ưu giao diện Admin: thanh danh sách hội thoại có avatar, badge số tin chưa đọc, thời gian tương đối.
- Kiểm thử luồng gửi nhận 2 chiều trên 2 tab trình duyệt riêng biệt.
