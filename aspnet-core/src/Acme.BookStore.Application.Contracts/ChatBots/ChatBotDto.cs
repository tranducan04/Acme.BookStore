using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Acme.BookStore.ChatBots;

public class AskChatBotDto
{
    [Required(ErrorMessage = "Vui lòng nhập tin nhắn")]
    public string Message { get; set; } = string.Empty;
}

public class ChatBotRecommendedBookDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? CoverImage { get; set; }
    public float Price { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public int StockCount { get; set; }
}


public class ChatBotResponseDto
{
    public string Reply { get; set; } = string.Empty;
    public List<ChatBotRecommendedBookDto> RecommendedBooks { get; set; } = new();
}
