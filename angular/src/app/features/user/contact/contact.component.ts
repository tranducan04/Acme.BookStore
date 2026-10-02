import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  private readonly toastService = inject(ToastService);

  contactForm = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  isSubmitting: boolean = false;

  sendContact(): void {
    if (!this.contactForm.name.trim() || !this.contactForm.email.trim() || !this.contactForm.message.trim()) {
      this.toastService.showWarning('Vui lòng điền đầy đủ họ tên, email và nội dung tin nhắn.');
      return;
    }

    this.isSubmitting = true;
    setTimeout(() => {
      this.toastService.showSuccess('🎉 Cảm ơn bạn đã liên hệ! Đội ngũ Acme BookStore sẽ phản hồi qua email trong thời gian sớm nhất.');
      this.contactForm = { name: '', email: '', phone: '', subject: '', message: '' };
      this.isSubmitting = false;
    }, 600);
  }
}
