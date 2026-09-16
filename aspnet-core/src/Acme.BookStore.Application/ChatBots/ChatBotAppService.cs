using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Acme.BookStore.Authors;
using Acme.BookStore.Books;
using Acme.BookStore.Categories;
using Microsoft.Extensions.Configuration;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace Acme.BookStore.ChatBots;

public class ChatBotAppService : ApplicationService, IChatBotAppService
{
    private readonly IRepository<Book, Guid> _bookRepository;
    private readonly IRepository<Author, Guid> _authorRepository;
    private readonly IRepository<Category, Guid> _categoryRepository;
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;

    public ChatBotAppService(
        IRepository<Book, Guid> bookRepository,
        IRepository<Author, Guid> authorRepository,
        IRepository<Category, Guid> categoryRepository,
        IConfiguration configuration)
    {
        _bookRepository = bookRepository;
        _authorRepository = authorRepository;
        _categoryRepository = categoryRepository;
        _configuration = configuration;
        _httpClient = new HttpClient();
    }
    public async Task<ChatBotResponseDto> AskAsync(AskChatBotDto input)
    {
        var apiKey = _configuration["Gemini:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey) || apiKey == "DÁN_KEY_GEMINI_CỦA_BẠN_VÀO_ĐÂY")
        {
            return new ChatBotResponseDto
            {
                Reply = "⚠️ Ban quản trị chưa cấu hình Gemini API Key. Vui lòng thử lại sau!"
            };
        }
        // 1. Lấy dữ liệu kho sách thực tế trong CSDL làm Context
        var books = await _bookRepository.GetListAsync();
        var authors = (await _authorRepository.GetListAsync()).ToDictionary(a => a.Id, a => a.Name);
        var categories = (await _categoryRepository.GetListAsync()).ToDictionary(c => c.Id, c => c.Name);

        var bookListText = new StringBuilder();
        foreach (var b in books.Take(30))
        {
             var author = b.AuthorId.HasValue && authors.ContainsKey(b.AuthorId.Value) ? authors[b.AuthorId.Value] : "Chưa rõ";
             var category = b.CategoryId.HasValue && categories.ContainsKey(b.CategoryId.Value) ? categories[b.CategoryId.Value] : "Chưa phân loại";
             var ageText = b.AgeLimit switch { 1 => "Nhi đồng (Trẻ nhỏ / Trẻ em)", 2 => "Thiếu niên", 3 => "Trưởng thành", _ => "Mọi độ tuổi" };

            bookListText.AppendLine($"- Tên sách: {b.Name} | Tác giả: {author} | Thể loại: {category} | Phù hợp độ tuổi: {ageText} | Giá: {b.Price:N0} VNĐ | Tồn kho: {b.StockCount}");
        }

        // 2. Thiết lập System Prompt
        var systemInstruction = $@"Bạn là trợ lý ảo AI thông minh và thân thiện của cửa hàng sách 'BookStore Official'. 
        Nhiệm vụ của bạn là tư vấn nhiệt tình, gợi ý những cuốn sách phù hợp dựa trên tâm trạng, sở thích, ĐỘ TUỔI, hoặc câu hỏi của khách hàng.
        Dưới đây là danh sách một số cuốn sách đang có sẵn tại cửa hàng:
        {bookListText}
        Hãy trả lời ngắn gọn, lịch sự, dùng các biểu tượng emoji vui vẻ. Khi khách hàng hỏi về sách cho trẻ em/nhi đồng/thiếu niên/người lớn, 
        hãy luôn ưu tiên chọn các cuốn sách có mác 'Phù hợp độ tuổi' khớp với yêu cầu của khách hàng!";

        // 3. Tạo Payload JSON gửi cho Google
        var payload = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = $"{systemInstruction}\n\nKhách hàng hỏi: {input.Message}" }
                    }
                }
            }
        };

        var jsonContent = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        // 4. Tự động lấy danh sách Model khả dụng từ Google
        var validModels = new List<string>();
        try
        {
            var listModelsUrl = $"https://generativelanguage.googleapis.com/v1beta/models?key={apiKey}";
            var listResponse = await _httpClient.GetAsync(listModelsUrl);
            if (listResponse.IsSuccessStatusCode)
            {
                var listJson = await listResponse.Content.ReadAsStringAsync();
                using var docList = JsonDocument.Parse(listJson);
                if (docList.RootElement.TryGetProperty("models", out var modelsElem))
                {
                    foreach (var m in modelsElem.EnumerateArray())
                    {
                        var name = m.GetProperty("name").GetString();
                        var methods = m.TryGetProperty("supportedGenerationMethods", out var methodsElem)
                            ? methodsElem.EnumerateArray().Select(x => x.GetString()).ToList()
                            : new List<string?>();

                        if (methods.Contains("generateContent") && !string.IsNullOrEmpty(name))
                        {
                            validModels.Add(name);
                        }
                    }
                }
            }
        }
        catch { }

        if (!validModels.Any())
        {
            validModels.AddRange(new[] { "models/gemini-2.5-flash", "models/gemini-1.5-flash", "models/gemini-1.5-flash-latest" });
        }

        var orderedModels = validModels
            .OrderByDescending(m => m.Contains("flash"))
            .ThenByDescending(m => m.Contains("2.5"))
            .ToList();

        string lastResponseString = string.Empty;
        HttpResponseMessage? response = null;

        foreach (var m in orderedModels)
        {
            var modelPath = m.StartsWith("models/") ? m : $"models/{m}";
            var url = $"https://generativelanguage.googleapis.com/v1beta/{modelPath}:generateContent?key={apiKey}";

            response = await _httpClient.PostAsync(url, jsonContent);
            lastResponseString = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode) break;
        }

        if (response == null || !response.IsSuccessStatusCode)
        {
            return new ChatBotResponseDto
            {
                Reply = $"🤖 Lỗi từ Gemini API ({(int)(response?.StatusCode ?? System.Net.HttpStatusCode.BadRequest)}): {lastResponseString}"
            };
        }

        using var doc = JsonDocument.Parse(lastResponseString);
        var reply = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString() ?? string.Empty;

        // 🌟 5. TỰ ĐỘNG TÌM CÁC CUỐN SÁCH ĐƯỢC GEMINI NHẮC ĐẾN ĐỂ TẠO THẺ MUA HÀNG
        var matchedBooks = new List<ChatBotRecommendedBookDto>();
        foreach (var b in books)
        {
            if (reply.Contains(b.Name, StringComparison.OrdinalIgnoreCase))
            {
                var author = b.AuthorId.HasValue && authors.ContainsKey(b.AuthorId.Value) ? authors[b.AuthorId.Value] : "Chưa rõ";
                 matchedBooks.Add(new ChatBotRecommendedBookDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    CoverImage = b.CoverImage,
                    Price = b.Price, 
                    AuthorName = author,
                    StockCount = b.StockCount
                });
            }
        }

        return new ChatBotResponseDto
        {
            Reply = reply,
            RecommendedBooks = matchedBooks.Take(3).ToList() // Tối đa 3 thẻ sách để khung chat đẹp gọn
        };
    }
}
