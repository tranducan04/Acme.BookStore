# Quickstart & Verification Guide: Live Chat Support

## Kịch bản 1: Khách vãng lai truy cập Chat
1. Mở trình duyệt ẩn danh (Incognito) hoặc đăng xuất tài khoản.
2. Bấm vào menu **"Hỗ trợ trực tuyến"** (`/chat-support`).
3. **Kết quả mong đợi**:
   - Giao diện hiển thị thẻ thông báo: "Vui lòng đăng nhập để bắt đầu trò chuyện với nhân viên hỗ trợ".
   - Có nút **"Đăng nhập ngay"**.
   - Bật Console (F12) kiểm tra: **0 lỗi 401 Unauthorized**.

## Kịch bản 2: Khách hàng đã đăng nhập nhắn tin với Admin
1. Đăng nhập bằng tài khoản Khách hàng (ví dụ: `user`).
2. Vào menu **"Hỗ trợ trực tuyến"** (`/chat-support`).
3. Nhập tin nhắn: "Xin chào shop, mình cần tư vấn sách lập trình C#". Bấm phím **Enter**.
4. Mở tab trình duyệt thứ 2, đăng nhập với tài khoản `admin`, truy cập menu **"Hỗ trợ khách hàng"** (`/admin/chat`).
5. **Kết quả mong đợi**:
   - Ở phía Admin: Xuất hiện cuộc trò chuyện của khách hàng `user` ở đầu danh sách bên trái kèm chấm đỏ/badge số `1`.
   - Admin bấm chọn khách hàng đó: Khung chat tải toàn bộ tin nhắn, badge đỏ tự động biến mất.
   - Admin gõ câu trả lời: "Chào bạn, bên mình đang có sách Pro C# 10 rất hay ạ!" và bấm Gửi.
   - Ở phía Khách hàng: Tin nhắn phản hồi của Admin lập tức xuất hiện trong bong bóng bên trái không cần F5 tải lại trang.
