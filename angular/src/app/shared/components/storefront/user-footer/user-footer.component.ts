import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="storefront-footer bg-white border-top mt-5 pt-5 pb-4">
      <div class="container">
        <div class="row g-4 mb-4">
          
          <!-- Cột 1: Thông tin thương hiệu & Sứ mệnh -->
          <div class="col-12 col-md-6 col-lg-3">
            <div class="d-flex align-items-center gap-2 mb-3">
              <div class="brand-logo-icon rounded-3 d-flex align-items-center justify-content-center bg-primary text-white shadow-sm"
                   style="width: 38px; height: 38px;">
                <i class="fas fa-book-reader fs-5"></i>
              </div>
              <span class="fw-bold fs-5 text-dark">Acme <span class="text-primary">BookStore</span></span>
            </div>
            <p class="text-muted fs-7 mb-3">
              Không gian Thư viện Số hiện đại kết nối hàng triệu độc giả Việt Nam với kho tàng tri thức bất tận. Cam kết 100% sách chuẩn bản quyền.
            </p>
            <div class="d-flex align-items-center gap-2 social-icons">
              <a href="#" class="social-icon rounded-circle d-flex align-items-center justify-content-center text-decoration-none" aria-label="Facebook">
                <i class="fab fa-facebook-f fs-7"></i>
              </a>
              <a href="#" class="social-icon rounded-circle d-flex align-items-center justify-content-center text-decoration-none" aria-label="YouTube">
                <i class="fab fa-youtube fs-7"></i>
              </a>
              <a href="#" class="social-icon rounded-circle d-flex align-items-center justify-content-center text-decoration-none" aria-label="Instagram">
                <i class="fab fa-instagram fs-7"></i>
              </a>
              <a href="#" class="social-icon rounded-circle d-flex align-items-center justify-content-center text-decoration-none" aria-label="TikTok">
                <i class="fab fa-tiktok fs-7"></i>
              </a>
            </div>
          </div>

          <!-- Cột 2: Khám phá sách -->
          <div class="col-6 col-md-6 col-lg-3">
            <h6 class="fw-bold text-dark mb-3">Khám Phá Sách</h6>
            <ul class="list-unstyled d-flex flex-column gap-2 fs-7 footer-links">
              <li><a routerLink="/books" class="text-decoration-none text-muted">Tất cả đầu sách</a></li>
              <li><a routerLink="/books" [queryParams]="{ sortBy: 'bestSeller' }" class="text-decoration-none text-muted">Sách bán chạy nhất</a></li>
              <li><a routerLink="/books" [queryParams]="{ sortBy: 'newest' }" class="text-decoration-none text-muted">Sách mới phát hành</a></li>
              <li><a routerLink="/books" class="text-decoration-none text-muted">Thể loại tuyển chọn</a></li>
              <li><a routerLink="/about" class="text-decoration-none text-muted">Văn hóa đọc sách</a></li>
            </ul>
          </div>

          <!-- Cột 3: Hỗ trợ khách hàng -->
          <div class="col-6 col-md-6 col-lg-3">
            <h6 class="fw-bold text-dark mb-3">Hỗ Trợ Khách Hàng</h6>
            <ul class="list-unstyled d-flex flex-column gap-2 fs-7 footer-links">
              <li><a routerLink="/contact" class="text-decoration-none text-muted">Trung tâm trợ giúp</a></li>
              <li><a routerLink="/my-orders" class="text-decoration-none text-muted">Tra cứu đơn hàng</a></li>
              <li><a routerLink="/contact" class="text-decoration-none text-muted">Chính sách đổi trả 1-1</a></li>
              <li><a routerLink="/contact" class="text-decoration-none text-muted">Chính sách vận chuyển</a></li>
              <li><a routerLink="/contact" class="text-decoration-none text-muted">Câu hỏi thường gặp (FAQ)</a></li>
            </ul>
          </div>

          <!-- Cột 4: Phương thức thanh toán & Liên hệ -->
          <div class="col-12 col-md-6 col-lg-3">
            <h6 class="fw-bold text-dark mb-3">Phương Thức Thanh Toán</h6>
            <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
              <span class="badge bg-light text-dark border p-2 d-flex align-items-center gap-1">
                <i class="fas fa-qrcode text-primary"></i> Chuyển khoản VietQR
              </span>
              <span class="badge bg-light text-dark border p-2 d-flex align-items-center gap-1">
                <i class="fas fa-money-bill-wave text-success"></i> Tiền mặt COD
              </span>
            </div>
            <h6 class="fw-bold text-dark mb-2 fs-7">Hotline Hỗ Trợ</h6>
            <div class="fs-6 fw-bold text-primary mb-1">
              <i class="fas fa-phone-alt me-1"></i> 1900 888 666
            </div>
            <div class="fs-8 text-muted">
              (8:00 - 21:00 hàng ngày, kể cả Lễ Tết)
            </div>
          </div>

        </div>

        <div class="border-top pt-3 d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 text-muted fs-8">
          <div>
            © 2026 <strong>Acme BookStore</strong>. Tất cả quyền được bảo lưu.
          </div>
          <div class="d-flex gap-3">
            <a routerLink="/about" class="text-decoration-none text-muted">Điều khoản dịch vụ</a>
            <span>•</span>
            <a routerLink="/about" class="text-decoration-none text-muted">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .fs-7 { font-size: 0.85rem; }
    .fs-8 { font-size: 0.75rem; }
    .social-icon {
      width: 34px;
      height: 34px;
      background-color: #f1f5f9;
      color: #475569;
      transition: all 0.2s ease;
      &:hover {
        background-color: #1e40af;
        color: #ffffff;
        transform: translateY(-2px);
      }
    }
    .footer-links a {
      transition: color 0.2s ease, transform 0.2s ease;
      display: inline-block;
      &:hover {
        color: #1e40af !important;
        transform: translateX(4px);
      }
    }
    :host-context([data-theme="dark"]) {
      .storefront-footer {
        background-color: #0b1329 !important;
        border-color: #1e293b !important;
      }
      .text-dark { color: #f8fafc !important; }
      .text-muted { color: #94a3b8 !important; }
      .social-icon {
        background-color: #111c44 !important;
        color: #cbd5e1 !important;
        &:hover {
          background-color: #3b82f6 !important;
          color: #ffffff !important;
        }
      }
      .footer-links a:hover {
        color: #60a5fa !important;
      }
      .badge.bg-light {
        background-color: #111c44 !important;
        border-color: #1e293b !important;
        color: #f8fafc !important;
      }
    }
  `]
})
export class UserFooterComponent {}
