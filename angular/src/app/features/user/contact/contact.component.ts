import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '@abp/ng.core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, CoreModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  animations: [
    trigger('pageEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(25px)' }),
        animate('600ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ContactComponent {
  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: '',
  };

  sendContact() {
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.message) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    alert('🎉 Cảm ơn bạn đã liên hệ! Đội ngũ BookStore sẽ phản hồi qua email trong thời gian sớm nhất.');
    this.contactForm = { name: '', email: '', subject: '', message: '' };
  }
}
