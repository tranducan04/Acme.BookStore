import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '@abp/ng.core';

@Component({
  selector: 'app-logout',
  standalone: true,
  template: `<div class="p-4 text-center">Đang đăng xuất...</div>`,
})
export class LogoutComponent implements OnInit {
  private authService = inject(AuthService);

  ngOnInit(): void {
    if (confirm('❓ Bạn có chắc chắn muốn đăng xuất không?')) {
      this.authService.logout().subscribe();
    } else {
      window.history.back();
    }
  }
}
