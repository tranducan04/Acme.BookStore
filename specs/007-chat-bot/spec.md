# Feature Specification: AI Virtual Assistant / Chatbot (Trợ Lý Ảo Tư Vấn Sách AI Gemini)

**Feature Branch**: `007-chat-bot`  
**Created**: 2026-09-29 | **Last Clarified**: 2026-09-29  
**Status**: Clarified & Implemented (Reverse Specification)  
**Tài liệu liên quan**:
- Service Backend: `aspnet-core/src/Acme.BookStore.Application/ChatBots/ChatBotAppService.cs`
- Contracts & DTOs: `aspnet-core/src/Acme.BookStore.Application.Contracts/ChatBots/`
- Giao diện Storefront Widget: `angular/src/app/features/user/chat-bot/`
- Tích hợp Giỏ hàng: `CartSignalStore` (`angular/src/app/features/user/Carts/cart-signal.store.ts`)

---

## 📌 Tổng quan Nghiệp vụ (Business Overview)

Chức năng **Trợ lý ảo AI Gemini (ChatBot Assistant)** là tính năng thông minh đóng vai trò nhân viên tư vấn bán hàng số (Digital Sales Consultant) 24/7 cho `Acme.BookStore`:
1. **Tư vấn thông minh theo ngữ cảnh (Context-Aware Recommendation):** Ứng dụng mô hình AI tiên tiến (Google Gemini) kết hợp kỹ thuật RAG (Retrieval-Augmented Generation) lấy trực tiếp danh mục sách thực tế từ cơ sở dữ liệu để tư vấn cho khách theo sở thích, tâm trạng, độ tuổi độc giả hoặc mức giá.
2. **Thẻ sản phẩm tương tác mua ngay (Interactive Book Cards):** Khi AI gợi ý sách, hệ thống tự động phân tích câu trả lời, đối chiếu với CSDL để hiển thị các Thẻ sách trực quan (gồm ảnh bìa, giá, tác giả, trạng thái kho) kèm nút **"Thêm vào giỏ"** giúp khách mua sắm tức thì ngay trong khung chat.
3. **Widget nổi tiện lợi (Floating Bubble Widget):** Nằm gọn gàng ở góc màn hình khách hàng, cho phép mở/đóng linh hoạt mà không ảnh hưởng đến trải nghiệm duyệt web.

---

## 📌 Clarifications & Business Decisions (Quy tắc Nghiệp vụ)

1. **Kiến trúc RAG & Dữ liệu Grounding Thực tế (Ground Truth Data Injection)**:
   - Trước khi gửi câu hỏi của khách hàng tới Google Gemini, backend tự động truy vấn danh sách 30 cuốn sách mới nhất trong CSDL (kèm Tác giả, Thể loại, Giới hạn độ tuổi, Giá bán, Tồn kho).
   - Danh sách này được nhúng vào **System Instruction** để làm dữ liệu chuẩn (Grounding Context), ngăn ngừa hiện tượng "ảo giác" (AI Hallucination - AI bịa ra những cuốn sách không có trong cửa hàng).
2. **Cơ chế Phù hợp Độ tuổi (Age-Appropriate Matching)**:
   - Dựa trên trường `AgeLimit` của sách (Nhi đồng, Thiếu niên, Trưởng thành, Mọi độ tuổi), AI được huấn luyện ưu tiên gợi ý sách phù hợp khi phụ huynh hoặc độc giả hỏi sách theo lứa tuổi.
3. **Cơ chế Fallback Mô hình AI Linh hoạt (Dynamic Model Discovery & Fallback)**:
   - Backend tự động gọi endpoint `v1beta/models` của Google để phát hiện danh sách model Gemini khả dụng của API Key (ưu tiên `gemini-1.5-flash`, `gemini-2.5-flash`).
   - Nếu một model bị nghẽn hoặc hết hạn mức, hệ thống tự động fallback thử model kế tiếp, đảm bảo tính liên tục của dịch vụ.
4. **Trích xuất Thẻ sách Tương tác (Auto Entity Extraction & Conversion)**:
   - Backend phân tích văn bản câu trả lời của Gemini: Nếu câu trả lời có chứa tên cuốn sách nào trong kho, hệ thống tự động tạo danh sách `RecommendedBooks` (tối đa 3 cuốn sách nổi bật nhất).
   - Frontend hiển thị các thẻ sách này ngay dưới đoạn tin nhắn bot kèm nút thêm nhanh vào giỏ hàng qua `CartSignalStore`.
5. **Quyền riêng tư & Phân quyền Giao diện**:
   - Widget chat bot AI phục vụ chủ yếu cho Khách hàng duyệt sách (`isCustomer`).
   - Khách vãng lai chưa đăng nhập vẫn có thể trò chuyện với bot để tìm hiểu sách.

---

## User Scenarios & Testing (Kịch bản Người dùng & Kiểm thử)

### User Story 1 - Khách hàng Nhờ AI Gợi ý Sách theo Sở thích hoặc Độ tuổi (Priority: P1)

Là một **Khách hàng**, tôi muốn mở khung chat và nhờ AI tư vấn: *"Tìm cho tôi sách phiêu lưu kỳ ảo cho học sinh cấp 2"* để nhận được gợi ý chính xác những cuốn sách đang có sẵn tại cửa hàng.

- **Acceptance Scenarios (Gherkin):**
1. **Given** Khách hàng đang ở trang chủ cửa hàng, **When** Nhấn vào bong bóng chat AI ở góc dưới màn hình, **Then** Cửa sổ chat mở lên với lời chào đón thân thiện của Bot.
2. **Given** Cửa hàng có bán sách "Harry Potter" và "Chúa Nhẫn", **When** Khách hàng nhắn: "Tôi thích truyện phiêu lưu phép thuật, có sách nào hay không?", **Then** Gemini AI phản hồi lời khuyên nhiệt tình bằng tiếng Việt kèm emoji, và bên dưới tin nhắn tự động xuất hiện 1-2 thẻ sách tương ứng để khách bấm chọn.
3. **Given** Khách hàng hỏi về sách cho trẻ em dưới 10 tuổi, **When** AI xử lý, **Then** AI ưu tiên gợi ý các cuốn sách có nhãn độ tuổi "Nhi đồng / Trẻ nhỏ".

---

### User Story 2 - Khách hàng Thêm Sách Gợi ý vào Giỏ hàng Trực tiếp từ Khung Chat (Priority: P1)

Là một **Khách hàng**, sau khi được AI gợi ý cuốn sách ưng ý, tôi muốn bấm "Thêm vào giỏ" ngay trên thẻ sách trong tin nhắn bot mà không phải mất công tìm kiếm lại.

- **Acceptance Scenarios (Gherkin):**
1. **Given** Tin nhắn của Bot hiển thị thẻ sách "Đắc Nhân Tâm - 120,000₫", **When** Khách hàng nhấn nút "Thêm vào giỏ" trên thẻ sách, **Then** Hệ thống gọi `CartSignalStore.addToCart()`, badge số lượng trên giỏ hàng tăng lên, và nút chuyển sang trạng thái đã thêm thành công.

---

### User Story 3 - Xử lý Ngoại lệ khi Chưa Cấu hình API Key (Priority: P2)

Là một **Người dùng**, nếu hệ thống chưa được cấu hình API Key của Google Gemini, tôi muốn nhận được thông báo rõ ràng thay vì hệ thống bị treo hoặc báo lỗi kỹ thuật 500.

- **Acceptance Scenarios (Gherkin):**
1. **Given** File cấu hình backend chưa điền `Gemini:ApiKey`, **When** Khách hàng gửi câu hỏi cho Bot, **Then** Bot phản hồi ngay câu thông báo thân thiện: *"⚠️ Ban quản trị chưa cấu hình Gemini API Key. Vui lòng thử lại sau!"*.

---

## 📐 Data Contract & Cấu trúc DTOs

### 1. `AskChatBotDto` (Dữ liệu gửi từ Frontend):
- `Message` (`string`): Nội dung câu hỏi / yêu cầu tư vấn của người dùng.

### 2. `ChatBotRecommendedBookDto` (Thẻ sách gợi ý kèm theo):
- `Id` (`Guid`): Mã định danh cuốn sách.
- `Name` (`string`): Tên cuốn sách.
- `CoverImage` (`string?`): URL ảnh bìa sách.
- `Price` (`float`): Giá bán thực tế (VNĐ).
- `AuthorName` (`string`): Tên tác giả.
- `StockCount` (`int`): Số lượng còn trong kho.

### 3. `ChatBotResponseDto` (Dữ liệu trả về cho Frontend):
- `Reply` (`string`): Câu trả lời văn bản được sinh bởi Google Gemini.
- `RecommendedBooks` (`List<ChatBotRecommendedBookDto>`): Danh sách thẻ sách trích xuất được (tối đa 3 thẻ).

---

## 🔌 API Endpoint (`IChatBotAppService`)

| Phương thức | Đường dẫn API | Diễn giải |
| :--- | :--- | :--- |
| `POST` | `/api/app/chat-bot/ask` | Gửi câu hỏi tư vấn và nhận phản hồi AI kèm thẻ sách gợi ý |
