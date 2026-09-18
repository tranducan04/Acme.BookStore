import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { firstValueFrom } from 'rxjs';
import { CategoryService } from '../../../proxy/categories/category.service';
import { CategoryDto, CreateUpdateCategoryDto } from '../../../proxy/categories/models';
import { PermissionService, LocalizationPipe } from '@abp/ng.core';

@Component({
    selector: 'app-category',
    standalone: true,
    imports: [CommonModule, FormsModule, LocalizationPipe],
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss'],
    animations: [
        trigger('pageEnter', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(25px)' }),
                animate('600ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ])
    ]
})
export class CategoryComponent implements OnInit {
    private categoryService = inject(CategoryService);
    public permission = inject(PermissionService);
    public categories = signal<CategoryDto[]>([]);
    public isLoading = signal<boolean>(false);
    public searchTerm = signal<string>('');
    public isModalOpen = signal<boolean>(false);
    public isEditMode = signal<boolean>(false);
    public selectedCategory = signal<any>({ name: '', description: '' });
    // TÌM THEO TÊN DANH MỤC
    public filteredCategories = computed(() => {
        const term = this.searchTerm().toLowerCase().trim();
        if (!term) return this.categories();
        return this.categories().filter(c =>
            c.name?.toLowerCase().includes(term)
        );
    });
    ngOnInit(): void {
        this.loadCategories();
    }
    async loadCategories() {
        this.isLoading.set(true);
        try {
            const res = await firstValueFrom(this.categoryService.getList({ maxResultCount: 1000 }));
            this.categories.set(res.items || []);
        } catch (err) {
            console.error('Lỗi tải danh mục:', err);
        } finally {
            this.isLoading.set(false);
        }
    }
    openCreateModal() {
        this.isEditMode.set(false);
        this.selectedCategory.set({ name: '', description: '' });
        this.isModalOpen.set(true);
    }
    openEditModal(category: CategoryDto) {
        this.isEditMode.set(true);
        this.selectedCategory.set({
            id: category.id,
            name: category.name || '',
            description: category.description || ''
        });
        this.isModalOpen.set(true);
    }
    closeModal() {
        this.isModalOpen.set(false);
    }
    async saveCategory() {
        const cat = this.selectedCategory();
        if (!cat.name?.trim()) {
            alert('⚠️ Vui lòng nhập tên danh mục!');
            return;
        }
        const input: CreateUpdateCategoryDto = {
            name: cat.name.trim(),
            description: cat.description?.trim() || null
        };
        try {
            if (this.isEditMode() && cat.id) {
                await firstValueFrom(this.categoryService.update(cat.id, input));
                alert('🎉 Cập nhật danh mục thành công!');
            } else {
                await firstValueFrom(this.categoryService.create(input));
                alert('🎉 Thêm danh mục mới thành công!');
            }
            this.closeModal();
            await this.loadCategories();
        } catch (err: any) {
            alert('❌ Thất bại: ' + (err?.error?.error?.message || err?.message));
        }
    }
    async deleteCategory(id?: string, name?: string) {
        if (!id) return;
        if (confirm(`❓ Bạn có chắc muốn xóa danh mục "${name}" không?`)) {
            try {
                await firstValueFrom(this.categoryService.delete(id));
                await this.loadCategories();
            } catch (err: any) {
                console.error('Lỗi xóa danh mục:', err); // 👈 Để ABP tự bật Popup lỗi đẹp
            }
        }
    }
}
