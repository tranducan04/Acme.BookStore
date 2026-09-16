using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace Acme.BookStore.ChatBots;

public interface IChatBotAppService : IApplicationService
{
    Task<ChatBotResponseDto> AskAsync(AskChatBotDto input);
}
