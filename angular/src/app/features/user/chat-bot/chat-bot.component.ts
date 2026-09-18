import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ChatBotService } from '../../../proxy/chat-bots/chat-bot.service';
import { ChatBotRecommendedBookDto } from '../../../proxy/chat-bots/models';
import { PermissionService, CoreModule } from '@abp/ng.core';
import { CartSignalStore } from '../Carts/cart-signal.store';

interface ChatMessage {
    sender: 'user' | 'bot';
    text: string;
    books?: ChatBotRecommendedBookDto[];
    time: Date;
}

@Component({
    selector: 'app-chat-bot',
    standalone: true,
    imports: [CommonModule, FormsModule, CoreModule],
    templateUrl: './chat-bot.component.html',
    styleUrls: ['./chat-bot.component.scss']
})
export class ChatBotComponent {
    private chatBotService = inject(ChatBotService);
    private permission = inject(PermissionService);
    private cartStore = inject(CartSignalStore);

    get isCustomer(): boolean {
        const isAdminOrAuthor = this.permission.getGrantedPolicy('BookStore.Books.Create') ||
            this.permission.getGrantedPolicy('BookStore.Books.Edit');
        return !isAdminOrAuthor;
    }

    public isOpen = signal<boolean>(false);
    public isTyping = signal<boolean>(false);
    public addingBookId = signal<string | null>(null);
    public inputMessage = signal<string>('');
    public messages = signal<ChatMessage[]>([
        {
            sender: 'bot',
            text: 'Xin chào! 👋 Tôi là trợ lý ảo AI Gemini của BookStore.\nBạn đang tìm thể loại sách nào hay cần tôi tư vấn gì hôm nay?',
            time: new Date()
        }
    ]);

    toggleChat() {
        this.isOpen.update(v => !v);
    }

    async addToCart(book: ChatBotRecommendedBookDto) {
        if (!book.id || this.addingBookId()) return;
        this.addingBookId.set(book.id);
        try {
            await this.cartStore.addToCart(book.id, 1);
        } finally {
            setTimeout(() => this.addingBookId.set(null), 500);
        }
    }

    async sendMessage(customText?: string) {
        const msg = (customText || this.inputMessage()).trim();
        if (!msg || this.isTyping()) return;

        this.messages.update(list => [...list, { sender: 'user', text: msg, time: new Date() }]);
        this.inputMessage.set('');
        this.isTyping.set(true);

        try {
            const res = await firstValueFrom(this.chatBotService.ask({ message: msg }));
            this.messages.update(list => [
                ...list,
                {
                    sender: 'bot',
                    text: res?.reply || 'Cảm ơn bạn đã quan tâm!',
                    books: res?.recommendedBooks || [],
                    time: new Date()
                }
            ]);
        } catch (err) {
            this.messages.update(list => [
                ...list,
                { sender: 'bot', text: '⚠️ Không thể kết nối với AI lúc này. Bạn vui lòng thử lại sau nhé!', time: new Date() }
            ]);
        } finally {
            this.isTyping.set(false);
        }
    }

    formatText(text: string): string {
        if (!text) return '';
        return text
            .replace(/\*\*/g, '')
            .replace(/^\*\s*/gm, '• ');
    }
}
