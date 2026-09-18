import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { firstValueFrom } from 'rxjs';
import { PublisherService } from '../../../proxy/publishers/publisher.service';
import { PublisherDto, CreateUpdatePublisherDto } from '../../../proxy/publishers/models';
import { LocalizationPipe } from '@abp/ng.core';

@Component({
    selector: 'app-publisher',
    standalone: true,
    imports: [CommonModule, FormsModule, LocalizationPipe],
    templateUrl: './publisher.component.html',
    styleUrl: './publisher.component.scss',
    animations: [
        trigger('pageEnter', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(25px)' }),
                animate('600ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ])
    ]
})
export class PublisherComponent implements OnInit {
    private publisherService = inject(PublisherService);

    // 🌟 SIGNALS QUẢN LÝ DỮ LIỆU & TRẠNG THÁI
    public publishers = signal<PublisherDto[]>([]);
    public isLoading = signal<boolean>(false);
    public searchTerm = signal<string>('');

    // 🌟 COMPUTED SIGNAL: Lọc tìm kiếm Nhà xuất bản mượt mà
    public filteredPublishers = computed(() => {
        let result = [...this.publishers()];
        const term = this.searchTerm().trim().toLowerCase();
        if (term) {
            result = result.filter(p =>
                p.name?.toLowerCase().includes(term) ||
                p.address?.toLowerCase().includes(term) ||
                p.phoneNumber?.toLowerCase().includes(term)
            );
        }
        return result;
    });
    public isModalOpen = signal<boolean>(false);
    public isEditMode = signal<boolean>(false);

    // Form State
    public selectedPublisherId = signal<string | null>(null);
    public formName = signal<string>('');
    public formAddress = signal<string>('');
    public formPhoneNumber = signal<string>('');

    ngOnInit(): void {
        this.loadPublishers();
    }

    // Tải danh sách NXB từ API
    async loadPublishers() {
        this.isLoading.set(true);
        try {
            const res = await firstValueFrom(this.publisherService.getList({ maxResultCount: 100, skipCount: 0 }));
            this.publishers.set(res.items || []);
        } catch (err) {
            console.error('Lỗi tải NXB:', err);
        } finally {
            this.isLoading.set(false);
        }
    }

    // Mở Modal Thêm mới
    openCreateModal() {
        this.isEditMode.set(false);
        this.selectedPublisherId.set(null);
        this.formName.set('');
        this.formAddress.set('');
        this.formPhoneNumber.set('');
        this.isModalOpen.set(true);
    }

    // Mở Modal Chỉnh sửa
    openEditModal(pub: PublisherDto) {
        this.isEditMode.set(true);
        this.selectedPublisherId.set(pub.id || null);
        this.formName.set(pub.name || '');
        this.formAddress.set(pub.address || '');
        this.formPhoneNumber.set(pub.phoneNumber || '');
        this.isModalOpen.set(true);
    }

    closeModal() {
        this.isModalOpen.set(false);
    }

    // Lưu dữ liệu (Thêm hoặc Sửa)
    async savePublisher() {
        if (!this.formName().trim()) {
            alert('⚠️ Vui lòng nhập tên Nhà xuất bản!');
            return;
        }

        const input: CreateUpdatePublisherDto = {
            name: this.formName(),
            address: this.formAddress(),
            phoneNumber: this.formPhoneNumber()
        };

        try {
            if (this.isEditMode() && this.selectedPublisherId()) {
                await firstValueFrom(this.publisherService.update(this.selectedPublisherId()!, input));
                alert('🎉 Cập nhật Nhà xuất bản thành công!');
            } else {
                await firstValueFrom(this.publisherService.create(input));
                alert('🎉 Tạo Nhà xuất bản mới thành công!');
            }
            this.closeModal();
            await this.loadPublishers();
        } catch (err: any) {
            console.error('Lỗi lưu NXB:', err);
            const msg = err?.error?.error?.message || err?.message || 'Lỗi không xác định';
            alert(`❌ Lưu thất bại: ${msg}`);
        }
    }

    // Xóa NXB
    async deletePublisher(id: string) {
        if (confirm('❓ Bạn có chắc muốn xóa nhà xuất bản này không?')) {
            try {
                await firstValueFrom(this.publisherService.delete(id));
                await this.loadPublishers();
            } catch (err: any) {
                console.error('Lỗi xóa NXB:', err); // 👈 Để ABP tự bật Popup lỗi đẹp
            }
        }
    }

    onInput(field: string, event: Event) {
        const val = (event.target as HTMLInputElement).value;
        if (field === 'name') this.formName.set(val);
        if (field === 'address') this.formAddress.set(val);
        if (field === 'phone') this.formPhoneNumber.set(val);
    }
}
