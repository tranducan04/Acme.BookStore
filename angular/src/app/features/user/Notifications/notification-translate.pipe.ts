import { Pipe, PipeTransform, inject } from '@angular/core';
import { SessionStateService } from '@abp/ng.core';

@Pipe({
  name: 'notifTranslate',
  standalone: true,
  pure: false
})
export class NotificationTranslatePipe implements PipeTransform {
  private sessionState = inject(SessionStateService);

  transform(value: string | undefined | null, field: 'title' | 'message' = 'title'): string {
    if (!value) return '';
    const lang = (this.sessionState.getLanguage() || 'vi').toLowerCase();
    const isEn = lang.startsWith('en');

    if (isEn) {
      if (field === 'title') {
        return this.translateTitleToEn(value);
      } else {
        return this.translateMessageToEn(value);
      }
    } else {
      if (field === 'title') {
        return this.translateTitleToVi(value);
      } else {
        return this.translateMessageToVi(value);
      }
    }
  }

  private translateTitleToEn(title: string): string {
    let t = title;
    t = t.replace(/Cập nhật trạng thái đơn hàng/gi, 'Order Status Updated');
    t = t.replace(/Đặt hàng thành công!/gi, 'Order Placed Successfully!');
    t = t.replace(/Có đơn hàng mới!/gi, 'New Order Received!');
    t = t.replace(/Đã hủy đơn hàng/gi, 'Order Cancelled');
    return t;
  }

  private translateMessageToEn(msg: string): string {
    let m = msg;

    // Pattern 1: Đơn hàng ORD-... trị giá ... VNĐ đã được tạo thành công.
    const createdMatch = m.match(/Đơn hàng (ORD-[^\s]+) trị giá ([^\s]+) VNĐ đã được tạo thành công/i);
    if (createdMatch) {
      return `Order ${createdMatch[1]} valued at ${createdMatch[2]} VND has been created successfully.`;
    }

    // Pattern 2: Đơn ORD-... (...) vừa được đặt bởi ...
    const adminOrderMatch = m.match(/Đơn (ORD-[^\s]+) \(([^)]+)\) vừa được đặt bởi (.*)/i);
    if (adminOrderMatch) {
      return `Order ${adminOrderMatch[1]} (${adminOrderMatch[2]}) was just placed by ${adminOrderMatch[3]}.`;
    }

    // Pattern 3: Đơn hàng ORD-... đã được hủy thành công...
    const cancelMatch = m.match(/Đơn hàng (ORD-[^\s]+) đã được hủy thành công\. Số lượng sách đã được hoàn lại kho\./i);
    if (cancelMatch) {
      return `Order ${cancelMatch[1]} has been cancelled successfully. Books returned to stock.`;
    }

    // Pattern 4: Đơn hàng ORD-...: <status>
    const statusMatch = m.match(/Đơn hàng (ORD-[^:\s]+):\s*(.*)/i);
    if (statusMatch) {
      let sub = statusMatch[2].trim();
      sub = sub.replace(/📦 Đang được đóng gói và chuẩn bị gửi/gi, '📦 Being packed and prepared for dispatch');
      sub = sub.replace(/🚚 Đang trên đường vận chuyển đến bạn/gi, '🚚 On the way to you');
      sub = sub.replace(/(🛵|🎉)?\s*Đã được giao thành công\.\s*Cảm ơn bạn!?\.?/gi, '🛵 Delivered successfully. Thank you!');
      sub = sub.replace(/❌ Đã được hủy bởi quản trị viên/gi, '❌ Cancelled by administrator');
      sub = sub.replace(/Đã được cập nhật/gi, 'Updated');
      return `Order ${statusMatch[1]}: ${sub}`;
    }

    return m;
  }

  private translateTitleToVi(title: string): string {
    let t = title;
    t = t.replace(/Order Status Updated/gi, 'Cập nhật trạng thái đơn hàng');
    t = t.replace(/Order Placed Successfully!/gi, 'Đặt hàng thành công!');
    t = t.replace(/New Order Received!/gi, 'Có đơn hàng mới!');
    t = t.replace(/Order Cancelled/gi, 'Đã hủy đơn hàng');
    return t;
  }

  private translateMessageToVi(msg: string): string {
    let m = msg;
    const createdMatch = m.match(/Order (ORD-[^\s]+) valued at ([^\s]+) VND has been created successfully/i);
    if (createdMatch) {
      return `Đơn hàng ${createdMatch[1]} trị giá ${createdMatch[2]} VNĐ đã được tạo thành công.`;
    }
    return m;
  }
}
