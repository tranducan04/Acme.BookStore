
export interface AskChatBotDto {
  message: string;
}

export interface ChatBotRecommendedBookDto {
  id?: string;
  name?: string;
  coverImage?: string | null;
  price?: number;
  authorName?: string;
  stockCount?: number;
}

export interface ChatBotResponseDto {
  reply?: string;
  recommendedBooks?: ChatBotRecommendedBookDto[];
}
