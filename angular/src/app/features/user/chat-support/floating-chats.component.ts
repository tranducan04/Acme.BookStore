import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerChatComponent } from './customer-chat.component';
import { ChatBotComponent } from '../chat-bot/chat-bot.component';
import { PermissionService } from '@abp/ng.core';

@Component({
  selector: 'app-floating-chats',
  standalone: true,
  imports: [CommonModule, CustomerChatComponent, ChatBotComponent],
  template: `
    @if (isCustomer) {
      <div class="floating-chat-container position-fixed d-flex flex-column align-items-end"
           style="bottom: 24px; right: 24px; z-index: 1050; gap: 14px; pointer-events: none;">
        
        <!-- Live Support Chat Popup Window -->
        @if (isLiveChatOpen()) {
          <div class="chat-popup shadow-lg rounded-4 overflow-hidden border bg-white"
               style="pointer-events: auto; width: 380px; max-width: 90vw; height: 520px; animation: popupSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
            <div class="chat-popup-header bg-primary text-white p-3 d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <div class="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center"
                     style="width: 32px; height: 32px;">
                  <i class="fas fa-headset fs-7"></i>
                </div>
                <div>
                  <div class="fw-bold fs-7">Nhân viên tư vấn Acme</div>
                  <div class="fs-9 text-white-50"><i class="fas fa-circle text-success fs-9 me-1"></i>Đang trực tuyến</div>
                </div>
              </div>
              <button type="button" class="btn-close btn-close-white" (click)="toggleLiveChat()" aria-label="Đóng"></button>
            </div>
            <div class="chat-popup-body" style="height: calc(100% - 60px); overflow-y: auto;">
              <app-customer-chat />
            </div>
          </div>
        }

        <!-- AI Assistant Popup Window -->
        @if (isAiChatOpen()) {
          <div class="chat-popup shadow-lg rounded-4 overflow-hidden border bg-white"
               style="pointer-events: auto; width: 380px; max-width: 90vw; height: 520px; animation: popupSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
            <div class="chat-popup-header ai-header text-white p-3 d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <div class="rounded-circle bg-white text-info d-flex align-items-center justify-content-center shadow-sm"
                     style="width: 32px; height: 32px;">
                  <i class="fas fa-robot fs-7 text-primary"></i>
                </div>
                <div>
                  <div class="fw-bold fs-7">Trợ lý ảo AI Gemini</div>
                  <div class="fs-9 text-white-50">Tư vấn tìm sách thông minh 24/7</div>
                </div>
              </div>
              <button type="button" class="btn-close btn-close-white" (click)="toggleAiChat()" aria-label="Đóng"></button>
            </div>
            <div class="chat-popup-body" style="height: calc(100% - 60px); overflow-y: auto;">
              <app-chat-bot [isEmbedded]="true" />
            </div>
          </div>
        }

        <!-- 2 NÚT NỔI XẾP CHỒNG DỌC (VERTICAL STACK) -->
        <div class="buttons-stack d-flex flex-column gap-2" style="pointer-events: auto;">
          
          <!-- Nút 1 (Ở trên): Live Support Chat (Xanh dương) -->
          <button type="button"
                  class="btn btn-floating-chat live-support-btn rounded-circle shadow-lg position-relative d-flex align-items-center justify-content-center border-0 text-white"
                  [class.active]="isLiveChatOpen()"
                  (click)="toggleLiveChat()"
                  title="Nhân viên tư vấn Acme BookStore"
                  aria-label="Nhân viên tư vấn Acme BookStore">
            <i class="fas" [class.fa-headset]="!isLiveChatOpen()" [class.fa-times]="isLiveChatOpen()"></i>
            <span class="chat-tooltip-badge d-none d-md-block">Tư vấn viên</span>
          </button>

          <!-- Nút 2 (Ở dưới): AI Assistant Chat (Tím - Xanh ngọc gradient) -->
          <button type="button"
                  class="btn btn-floating-chat ai-assistant-btn rounded-circle shadow-lg position-relative d-flex align-items-center justify-content-center border-0 text-white"
                  [class.active]="isAiChatOpen()"
                  (click)="toggleAiChat()"
                  title="Trợ lý ảo AI Gemini"
                  aria-label="Trợ lý ảo AI Gemini">
            <i class="fas" [class.fa-robot]="!isAiChatOpen()" [class.fa-times]="isAiChatOpen()"></i>
            <span class="chat-tooltip-badge d-none d-md-block">AI Gemini</span>
          </button>

        </div>

      </div>
    }
  `,
  styles: [`
    @keyframes popupSlideUp {
      from { transform: translateY(30px) scale(0.95); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
    .btn-floating-chat {
      width: 52px;
      height: 52px;
      font-size: 1.25rem;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      cursor: pointer;

      &:hover {
        transform: scale(1.1);
        .chat-tooltip-badge {
          opacity: 1;
          visibility: visible;
          transform: translateX(0);
        }
      }
    }
    .live-support-btn {
      background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%) !important;
      box-shadow: 0 8px 20px rgba(30, 64, 175, 0.35) !important;
    }
    .ai-assistant-btn {
      background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%) !important;
      box-shadow: 0 8px 20px rgba(79, 70, 229, 0.35) !important;
    }
    .ai-header {
      background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%) !important;
    }
    .chat-tooltip-badge {
      position: absolute;
      right: 64px;
      top: 50%;
      transform: translateY(-50%) translateX(10px);
      background: rgba(15, 23, 42, 0.9);
      color: #ffffff;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .fs-7 { font-size: 0.85rem; }
    .fs-9 { font-size: 0.68rem; }

    :host-context([data-theme="dark"]) {
      .chat-popup {
        background: #111c44 !important;
        border-color: #1e293b !important;
      }
    }
  `]
})
export class FloatingChatsComponent {
  private permission = inject(PermissionService);

  get isCustomer(): boolean {
    const isAdmin = this.permission.getGrantedPolicy('BookStore.Books.Create');
    return !isAdmin;
  }

  isLiveChatOpen = signal<boolean>(false);
  isAiChatOpen = signal<boolean>(false);

  toggleLiveChat(): void {
    if (this.isLiveChatOpen()) {
      this.isLiveChatOpen.set(false);
    } else {
      this.isLiveChatOpen.set(true);
      this.isAiChatOpen.set(false);
    }
  }

  toggleAiChat(): void {
    if (this.isAiChatOpen()) {
      this.isAiChatOpen.set(false);
    } else {
      this.isAiChatOpen.set(true);
      this.isLiveChatOpen.set(false);
    }
  }
}
