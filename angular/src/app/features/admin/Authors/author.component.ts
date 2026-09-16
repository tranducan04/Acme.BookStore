import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthorService } from '@proxy/authors';
import { firstValueFrom } from 'rxjs';

import { PermissionService } from '@abp/ng.core';

@Component({
  selector: 'app-author',
  templateUrl: './author.component.html',
  styleUrl: './author.component.scss',
  imports: [CommonModule, FormsModule],
  animations: [
    trigger('pageEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(25px)' }),
        animate('600ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class AuthorComponent implements OnInit {
  private authorService = inject(AuthorService);
  public permission = inject(PermissionService);

  // 🌟 SIGNALS MANAGING STATE TRỰC TIẾP TRONG COMPONENT
  public authors = signal<any[]>([]);
  public isLoading = signal<boolean>(false);
  public searchTerm = signal<string>('');

  // 🌟 COMPUTED SIGNAL: Tìm kiếm theo tên tác giả tức thì
  public filteredAuthors = computed(() => {
    let result = [...this.authors()];
    const term = this.searchTerm().trim().toLowerCase();
    if (term) {
      result = result.filter(a => a.name?.toLowerCase().includes(term));
    }
    return result;
  });

  // Form Modal State (Pure Angular Signal)
  public isModalOpen = signal<boolean>(false);
  public selectedAuthor = signal<any>({});
  public isEditMode = signal<boolean>(false);

  ngOnInit(): void {
    this.loadAuthors();
  }

  async loadAuthors() {
    this.isLoading.set(true);
    try {
      const res = await firstValueFrom(this.authorService.getList({ maxResultCount: 1000, skipCount: 0 }));
      this.authors.set(res.items || []);
    } catch (err) {
      console.error('Lỗi tải tác giả:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.selectedAuthor.set({
      name: '',
      birthDate: new Date().toISOString().substring(0, 10),
      shortBio: ''
    });
    this.isModalOpen.set(true);
  }

  openEditModal(author: any) {
    this.isEditMode.set(true);
    this.selectedAuthor.set({
      ...author,
      birthDate: author.birthDate ? new Date(author.birthDate).toISOString().substring(0, 10) : ''
    });
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  // One-way binding handler
  updateAuthorField(field: string, event: Event) {
    const val = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.selectedAuthor.update(a => ({ ...a, [field]: val }));
  }

  async saveAuthor() {
    const authorData = this.selectedAuthor();
    if (!authorData.name) {
      alert('Vui lòng nhập tên tác giả!');
      return;
    }

    const payload: any = {
      name: authorData.name,
      birthDate: authorData.birthDate ? new Date(authorData.birthDate).toISOString() : new Date().toISOString(),
      shortBio: authorData.shortBio || ''
    };

    try {
      if (this.isEditMode()) {
        await firstValueFrom(this.authorService.update(authorData.id, payload));
      } else {
        await firstValueFrom(this.authorService.create(payload));
      }
      await this.loadAuthors();
      this.closeModal();
    } catch (err) {
      console.error('Lỗi lưu tác giả:', err);
    }
  }

  async deleteAuthor(id: string) {
    if (confirm('❓ Bạn có chắc chắn muốn xóa tác giả này không?')) {
      try {
        await firstValueFrom(this.authorService.delete(id));
        alert('🎉 Xóa tác giả thành công!');
        await this.loadAuthors();
      } catch (err: any) {
        console.error('Lỗi xóa tác giả:', err);
      }
    }
  }
}
