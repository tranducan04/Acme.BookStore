# Research & Architecture Decisions: Live Chat Support

**Feature**: `002-live-chat-support`  
**Date**: 2026-09-28  

## 1. Trạng thái kết nối SignalR & Bearer Token

### Vấn đề:
Khi kết nối SignalR WebSockets từ Angular tới ASP.NET Core backend, token xác thực không được gửi qua Header HTTP thông thường trong pha bắt tay WebSocket ban đầu trên một số trình duyệt, mà được gửi qua query param `?access_token=...`.

### Giải pháp trong Acme.BookStore:
- Frontend `ChatSignalRService` cấu hình:
  ```typescript
  withUrl(`${baseUrl}/signalr-hubs/chat`, {
    accessTokenFactory: () => this.oAuthService.getAccessToken() || '',
  })
  ```
- Backend `BookStoreHttpApiHostModule.cs` đã có sẵn middleware trung gian đọc token từ query string và gán vào `Headers["Authorization"] = "Bearer " + accessToken` trước khi gọi `UseAuthentication()`.
- Provider định danh `AbpUserIdProvider` trích xuất `sub` / `ClaimTypes.NameIdentifier` và chuẩn hóa về lowercase để `Clients.User(userId)` gửi chính xác.

## 2. Quản lý trạng thái bằng Angular Signals

### Vấn đề:
Trước đây, các component chat sử dụng mảng biến thường `messages: ChatMessageDto[] = []` và `[(ngModel)]="newMessage"`. Khi có sự kiện SignalR bắn về qua callback, việc push vào mảng không kích hoạt OnPush Change Detection tốt và dễ gây desync hoặc cuộn màn hình giật lag.

### Giải pháp:
- Toàn bộ trạng thái chuyển thành Signals:
  - `messages = signal<ChatMessageDto[]>([])`
  - `inputText = signal<string>('')`
  - `conversations = signal<ConversationDto[]>([])`
  - `selectedUser = signal<ConversationDto | null>(null)`
- Cập nhật mảng bằng immutable update:
  ```typescript
  this.messages.update(prev => [...prev, newMsg]);
  ```
- Ô nhập liệu áp dụng One-Way Binding:
  ```html
  <input type="text" [value]="inputText()" (input)="inputText.set($any($event.target).value)" (keyup.enter)="sendMessage()" />
  ```

## 3. Xử lý Khách vãng lai (Guest Access)

### Vấn đề:
Khi người dùng chưa đăng nhập bấm vào menu `/chat-support`:
1. `ChatAppService` yêu cầu `[Authorize]`, gọi API lấy lịch sử sẽ trả về lỗi HTTP 401 Unauthorized.
2. SignalR Hub kết nối không có Bearer token, `_currentUser.Id` là `null`, `senderId` là `Guid.Empty`.

### Giải pháp:
- Tại `CustomerChatComponent`, khai báo:
  ```typescript
  currentUserId = signal<string>('');
  isLoggedIn = computed(() => !!this.currentUserId());
  ```
- Trong `ngOnInit()`, đọc user id từ `ConfigStateService` hoặc `OAuthService`.
- Nếu `!isLoggedIn()`:
  - KHÔNG gọi `getAdminId()` hay `getMyChatHistory()`.
  - KHÔNG khởi động kết nối SignalR.
  - Template HTML hiển thị `@if (!isLoggedIn())`: Một thẻ hướng dẫn thẩm mỹ với icon headset, thông báo và nút "Đăng nhập ngay" (kêu gọi `OAuthService.initLoginFlow()`).
