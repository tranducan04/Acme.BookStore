import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService, BookDto, CreateUpdateBookDto, bookTypeOptions } from '@proxy/books';
import { AuthorService } from '@proxy/authors';
import { AuthService, PermissionService, LocalizationPipe } from '@abp/ng.core';
import { CartSignalStore } from '../../user/Carts/cart-signal.store';
import { firstValueFrom } from 'rxjs';
import { PublisherService } from '../../../proxy/publishers/publisher.service';
import { PublisherDto } from '../../../proxy/publishers/models';
import { BookReviewService } from '../../../proxy/book-reviews/book-review.service';
import { BookReviewSummaryDto } from '../../../proxy/book-reviews/models';
import { WishlistService } from '../../../proxy/wishlists/wishlist.service';
import { CategoryService } from '../../../proxy/categories/category.service';
import { CategoryDto } from '../../../proxy/categories/models';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-book',
  standalone: true,
  templateUrl: './book.component.html',
  styleUrl: './book.component.scss',
  imports: [CommonModule, FormsModule, LocalizationPipe],
  animations: [
    trigger('pageEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(25px)' }),
        animate('600ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class BookComponent implements OnInit {
  // 🌟 TIÊM PHỤ THUỘC (DEPENDENCY INJECTION) CÁC SERVICES
  private bookService = inject(BookService);      // Service gọi API Sách
  private authorService = inject(AuthorService);  // Service gọi API Tác giả
  private publisherService = inject(PublisherService);
  private authService = inject(AuthService);
  public publishers = signal<PublisherDto[]>([]);
  public permission = inject(PermissionService);  // Service kiểm tra Phân quyền ABP
  public cartStore = inject(CartSignalStore);     // Global Signal Store Giỏ hàng
  // 🌟 TRẠNG THÁI GIAO DIỆN QUẢN LÝ BẰNG ANGULAR SIGNALS (PURE SIGNAL STATE)
  public books = signal<any[]>([]);               // Signal danh sách toàn bộ sách
  public isLoading = signal<boolean>(false);       // Signal trạng thái loading
  public authors = signal<any[]>([]);             // Signal danh sách tác giả
  // 🌟 SIGNALS BỘ LỌC VÀ TÌM KIẾM
  public searchTerm = signal<string>('');          // Signal từ khóa tìm kiếm
  public selectedType = signal<string>('all');     // Signal thể loại chọn lọc
  public selectedAgeFilter = signal<string>('all'); // Signal bộ lọc độ tuổi
  public sortOrder = signal<string>('newest'); // Mặc định hiển thị sách mới nhất lên đầu
  // 🌟 SIGNALS PHÂN TRANG (PAGINATION)
  public currentPage = signal<number>(1);          // Signal trang hiện tại (Mặc định 1)
  public pageSize = signal<number>(8);             // Signal số lượng 8 sách / trang
  private reviewService = inject(BookReviewService);
  public reviewSummary = signal<BookReviewSummaryDto | null>(null);
  public userRating = signal<number>(5);
  public userComment = signal<string>('');
  public isSubmittingReview = signal<boolean>(false);
  private wishlistService = inject(WishlistService);
  public wishlistBookIds = signal<string[]>([]);
  // 1. Thêm Signal lưu ID sách đang bấm thêm giỏ
  public addingBookId = signal<string | null>(null);

  getStarsArray(rating: number = 5): { full: boolean; empty: boolean }[] {
    const stars = [];
    const rounded = Math.round((rating || 5) * 2) / 2;
    for (let i = 1; i <= 5; i++) {
      if (i <= rounded) {
        stars.push({ full: true, empty: false });
      } else {
        stars.push({ full: false, empty: true });
      }
    }
    return stars;
  }
  // Danh mục thể loại sách Tiếng Việt chuẩn
  public bookTypes = [
    { value: 0, key: 'Chưa xác định' },
    { value: 1, key: 'Phiêu lưu' },
    { value: 2, key: 'Tiểu sử' },
    { value: 3, key: 'Viễn tưởng / Dystopian' },
    { value: 4, key: 'Kỳ ảo / Fantasy' },
    { value: 5, key: 'Kinh dị' },
    { value: 6, key: 'Khoa học' },
    { value: 7, key: 'Khoa học viễn tưởng' },
    { value: 8, key: 'Thơ ca' }
  ];
  // 🌟 SIGNALS POPUP MODAL (PURE ANGULAR SIGNAL STATE)
  public isModalOpen = signal<boolean>(false);         // Signal Ẩn/Hiện Modal Thêm/Sửa
  public isDetailModalOpen = signal<boolean>(false);   // Signal Ẩn/Hiện Modal Xem chi tiết User
  public selectedBook = signal<any>({});              // Signal đối tượng sách đang chọn
  public isEditMode = signal<boolean>(false);          // Signal phân biệt Sửa hay Thêm mới
  private categoryService = inject(CategoryService);
  public dynamicCategories = signal<CategoryDto[]>([]);

  // 🌟 COMPUTED SIGNAL: TỰ ĐỘNG LỌC TOÀN BỘ SÁCH MATCH TỪ KHÓA TÌM KIẾM
  public filteredBooks = computed(() => {
    let result = [...this.books()];
    // 1. Lọc theo từ khóa tìm kiếm (Tên sách hoặc Tên tác giả)
    const term = this.searchTerm().trim().toLowerCase();
    if (term) {
      result = result.filter(b => b.name?.toLowerCase().includes(term) || b.authorName?.toLowerCase().includes(term));
    }
    // 2. Lọc theo thể loại được chọn (Hỗ trợ cả CategoryName mới và Type cũ)
    const typeVal = this.selectedType();
    if (typeVal !== 'all') {
      result = result.filter(b => {
        const catName = (b.categoryName || this.getBookTypeName(b.type) || '').toLowerCase();
        return catName === typeVal.toLowerCase() || b.type?.toString() === typeVal;
      });
    }
    // 3. Lọc theo Phân loại độ tuổi
    const ageVal = this.selectedAgeFilter();
    if (ageVal !== 'all') {
      result = result.filter(b => (b.ageLimit ?? 0).toString() === ageVal);
    }
    // 3. Sắp xếp danh sách (Mới nhất, Giá thấp -> cao, Giá cao -> thấp)
    const sort = this.sortOrder();
    result.sort((a, b) => {
      if (sort === 'newest') {
        const timeB = this.parseDateSafe(b.creationTime) || this.parseDateSafe(b.publishDate);
        const timeA = this.parseDateSafe(a.creationTime) || this.parseDateSafe(a.publishDate);
        return timeB - timeA;
      }
      if (sort === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sort === 'price_desc') return (b.price || 0) - (a.price || 0);
      return 0;
    });
    return result;
  });
  // 🌟 COMPUTED SIGNAL: DỒN SẢN PHẨM KHỚP TÌM KIẾM VÀO TRANG HIỆN TẠI (ĐỦ 8 SÁCH/TRANG)
  public paginatedBooks = computed(() => {
    const list = this.filteredBooks();
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return list.slice(startIndex, startIndex + this.pageSize());
  });
  // Tính tổng số trang và tổng số sách sau khi lọc
  public totalPages = computed(() => Math.ceil(this.filteredBooks().length / this.pageSize()) || 1);
  public totalCount = computed(() => this.filteredBooks().length);
  ngOnInit(): void {
    this.loadBooks();   // Tải danh sách sách khi khởi chạy
    this.loadAuthors(); // Tải danh sách tác giả cho dropdown
    this.loadPublishers();
    this.loadCategories();
    this.loadWishlist();
  }
  // 2. Thêm hàm xử lý khóa nút & phản hồi "✓ Đã thêm"
  async addToCart(event: Event, bookId: string) {
    event.stopPropagation(); // Ngăn mở modal chi tiết sách
    if (this.addingBookId()) return; // 🛑 Chặn bấm liên tục
    this.addingBookId.set(bookId);
    try {
      await this.cartStore.addToCart(bookId, 1);
    } finally {
      setTimeout(() => this.addingBookId.set(null), 1200);
    }
  }
  // 🌟 HÀM TẢI DANH SÁCH SÁCH TỪ BACKEND API
  async loadBooks() {
    this.isLoading.set(true);
    try {
      // Lấy toàn bộ sách về để lọc và phân trang mượt mà ở Client Side
      const res = await firstValueFrom(this.bookService.getList({ maxResultCount: 1000, skipCount: 0 }));
      const items = res.items || [];

      // Tải kèm thông tin review summary (điểm sao & lượt reviews)
      const enriched = await Promise.all(
        items.map(async (book) => {
          if (!book.id) return { ...book, averageRating: 5, totalReviews: 0 };
          try {
            const summary = await firstValueFrom(this.reviewService.getSummary(book.id));
            return {
              ...book,
              averageRating: summary?.averageRating || 5,
              totalReviews: summary?.totalReviews || 0
            };
          } catch {
            return { ...book, averageRating: 5, totalReviews: 0 };
          }
        })
      );

      this.books.set(enriched);
    } catch (err) {
      console.error('Lỗi tải danh sách sách:', err);
    } finally {
      this.isLoading.set(false);
    }
  }
  // 🌟 HÀM CHUYỂN TRANG PHÂN TRANG
  changePage(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages()) return;
    this.currentPage.set(newPage); // Cập nhật Signal trang hiện tại
  }
  // 🌟 HÀM TẢI DANH SÁCH TÁC GIẢ CHO DROPDOWN
  async loadAuthors() {
    try {
      const res = await firstValueFrom(this.authorService.getAuthorLookup());
      this.authors.set(res.items || []);
    } catch (err) {
      console.error('Lỗi tải tác giả:', err);
    }
  }
  async loadPublishers() {
    try {
      const res = await firstValueFrom(this.publisherService.getList({ maxResultCount: 100 }));
      this.publishers.set(res.items || []);
    } catch (err) {
      console.error('Lỗi tải danh sách NXB:', err);
    }
  }
  // 🌟 HÀM MỞ POPUP XEM CHI TIẾT SÁCH (CHO USER)
  // 🌟 HÀM MỞ POPUP XEM CHI TIẾT SÁCH & TẢI ĐÁNH GIÁ + GỢI Ý
  async openDetailModal(book: any) {
    this.selectedBook.set(book);
    this.isDetailModalOpen.set(true);
    this.userRating.set(5);
    this.userComment.set('');
    await this.loadReviewSummary(book.id);
  }
  // 🌟 HÀM ĐÓNG POPUP XEM CHI TIẾT SÁCH
  closeDetailModal() {
    this.isDetailModalOpen.set(false);
    this.reviewSummary.set(null);
  }
  // 🌟 TẢI ĐÁNH GIÁ & GỢI Ý SÁCH
  async loadReviewSummary(bookId: string) {
    try {
      const summary = await firstValueFrom(this.reviewService.getSummary(bookId));
      this.reviewSummary.set(summary);
    } catch (err) {
      console.error('Lỗi tải đánh giá:', err);
    }
  }
  // 🌟 CHỌN SAO ĐÁNH GIÁ
  setRating(stars: number) {
    this.userRating.set(stars);
  }
  // 🌟 GỬI ĐÁNH GIÁ MỚI
  async submitReview() {
    const comment = this.userComment().trim();
    if (!comment) {
      alert('⚠️ Vui lòng nhập nội dung nhận xét của bạn!');
      return;
    }
    const book = this.selectedBook();
    if (!book || !book.id) return;
    this.isSubmittingReview.set(true);
    try {
      await firstValueFrom(this.reviewService.create({
        bookId: book.id,
        rating: this.userRating(),
        comment: comment
      }));
      this.userComment.set('');
      this.userRating.set(5);
      alert('🎉 Đã gửi đánh giá thành công!');
      await this.loadReviewSummary(book.id);
    } catch (err: any) {
      alert('❌ Gửi đánh giá thất bại: ' + (err?.error?.error?.message || err?.message));
    } finally {
      this.isSubmittingReview.set(false);
    }
  }
  // 🌟 XÓA BÌNH LUẬN (ADMIN)
  async deleteReview(reviewId: string) {
    if (confirm('❓ Bạn có chắc muốn xóa nhận xét này không?')) {
      try {
        await firstValueFrom(this.reviewService.delete(reviewId));
        const book = this.selectedBook();
        if (book?.id) await this.loadReviewSummary(book.id);
      } catch (err) {
        console.error('Lỗi xóa đánh giá:', err);
      }
    }
  }
  // 🌟 HÀM 1-CLICK TOGGLE TRẠNG THÁI TỒN KHO (CHỈ ADMIN THỰC HIỆN)
  toggleStock(book: any) {
    if (!book.id) return;
    // Nếu không phải Admin thì chặn lại
    if (!this.permission.getGrantedPolicy('BookStore.Books.Edit')) {
      alert('ℹ️ Bạn đang xem ở chế độ Khách hàng. Chỉ Quản trị viên (Admin) mới có quyền đổi trạng thái tồn kho!');
      return;
    }
    const currentStock = book.stockCount ?? 0;
    let newStock = 0;
    if (currentStock > 0) {
      localStorage.setItem(`book_stock_${book.id}`, currentStock.toString());
      newStock = 0;
    } else {
      const savedStock = localStorage.getItem(`book_stock_${book.id}`);
      newStock = savedStock ? parseInt(savedStock, 10) : 50;
    }
    // Gọi API cập nhật trạng thái tồn kho
    this.books.update(list => list.map(b => b.id === book.id ?
      { ...b, stockCount: newStock } : b));
    // 1. Gửi lệnh lưu xuống CSDL ngầm dưới nền
    firstValueFrom(this.bookService.update(book.id, { ...book, stockCount: newStock }))
      .catch(err => {
        console.error('Lỗi đổi tồn kho:', err);
        // 2. Nếu đường truyền mạng lỗi hoặc Server bị sập, tự động đổi trả lại màu cũ trên giao diện để tránh báo sai cho Admin
        this.books.update(list => list.map(b => b.id === book.id ? { ...b, stockCount: currentStock } : b));
      });
  }
  // 🌟 HÀM MỞ MODAL THÊM SÁCH MỚI
  openCreateModal() {
    this.isEditMode.set(false);
    this.selectedBook.set({
      name: '',
      type: 0,
      categoryId: '',
      price: 100000,
      originalPrice: null, // 👈 Khởi tạo giá gốc
      stockCount: 50,
      publishDate: new Date().toISOString().substring(0, 10),
      authorId: this.authors().length > 0 ? this.authors()[0].id : null,
      publisherId: this.publishers().length > 0 ? this.publishers()[0].id : null,
      coverImage: '',
      ageLimit: 0
    });
    this.isModalOpen.set(true);
  }
  // 🌟 HÀM MỞ MODAL SỬA SÁCH
  openEditModal(book: any) {
    this.isEditMode.set(true);
    const authorId = book.authorId || this.authors().find(a => a.name === book.authorName)?.id || '';
    const publisherId = book.publisherId || this.publishers().find(p => p.name === book.publisherName)?.id || '';
    // Tìm categoryId theo ID hoặc theo tên danh mục
    const categoryId = book.categoryId || this.dynamicCategories().find(c => c.name === book.categoryName)?.id || '';
    this.selectedBook.set({
      id: book.id,
      name: book.name || '',
      type: book.type ?? 0,
      categoryId: categoryId, // 👈 Gán categoryId
      price: book.price ?? 0,
      originalPrice: book.originalPrice || null,
      stockCount: book.stockCount ?? 50,
      publishDate: book.publishDate ? book.publishDate.substring(0, 10) : '',
      authorId: authorId,
      publisherId: publisherId,
      coverImage: book.coverImage || '',
      ageLimit: book.ageLimit ?? 0
    });
    this.isModalOpen.set(true);
  }
  // 🌟 HÀM ĐÓNG MODAL THÊM/SỬA
  closeModal() {
    this.isModalOpen.set(false);
  }
  // 🌟 HÀM LƯU SÁCH (GỌI API TẠO HOẶC CẬP NHẬT)
  async saveBook() {
    const b = this.selectedBook();
    if (!b.name) {
      alert('⚠️ Vui lòng nhập tên sách!');
      return;
    }
    // 🔒 CHUYỂN ĐỔI THỂ LOẠI AN TOÀN SANG SỐ ENUM (KHÔNG BỊ NaN)
    let typeNumber = 0;
    if (typeof b.type === 'number') {
      typeNumber = isNaN(b.type) ? 0 : b.type;
    } else if (typeof b.type === 'string') {
      const foundEnum = this.bookTypes.find(t => t.key.toLowerCase() === b.type.toLowerCase());
      if (foundEnum) {
        typeNumber = foundEnum.value;
      } else {
        const parsed = Number(b.type);
        typeNumber = isNaN(parsed) ? 0 : parsed;
      }
    }
    // Chuẩn hóa DTO gửi lên Backend
    const input: CreateUpdateBookDto = {
      name: b.name,
      type: typeNumber,
      categoryId: b.categoryId || null,
      publishDate: b.publishDate || new Date().toISOString(),
      price: Number(b.price || 0),
      originalPrice: b.originalPrice ? Number(b.originalPrice) : null,
      authorId: b.authorId || null,
      publisherId: b.publisherId || null,
      stockCount: Number(b.stockCount ?? 50),
      coverImage: b.coverImage || null,
      ageLimit: Number(b.ageLimit ?? 0)
    };
    try {
      if (this.isEditMode() && b.id) {
        await firstValueFrom(this.bookService.update(b.id, input));
        alert('🎉 Cập nhật sách thành công!');
      } else {
        await firstValueFrom(this.bookService.create(input));
        alert('🎉 Tạo sách mới thành công!');
      }
      this.closeModal();
      await this.loadBooks();
    } catch (err: any) {
      console.error('Lỗi lưu sách:', err);
      alert('❌ Lưu sách thất bại: ' + (err?.error?.error?.message || err?.message));
    }
  }
  // 🌟 HÀM XÓA SÁCH (CHỈ ADMIN)
  async deleteBook(id: string) {
    if (confirm('❓ Bạn có chắc chắn muốn xóa cuốn sách này không?')) {
      try {
        await firstValueFrom(this.bookService.delete(id));
        await this.loadBooks();
      } catch (err) {
        console.error('Lỗi xóa sách:', err);
        alert('❌ Không thể xóa cuốn sách này!');
      }
    }
  }
  // 🌟 ONE-WAY BINDING: BẮT SỰ KIỆN TỪ SELECT GÁN VÀO SIGNAL
  updateBookField(field: string, event: Event) {
    let value: any = (event.target as HTMLInputElement | HTMLSelectElement).value;
    if (field === 'price' || field === 'stockCount' || field === 'ageLimit') {
      value = Number(value);
    } else if (field === 'originalPrice') {
      value = value ? Number(value) : null;
    }
    this.selectedBook.update(current => ({
      ...current,
      [field]: value
    }));
  }
  // 🌟 XỬ LÝ SỰ KIỆN TÌM KIẾM
  onSearchChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchTerm.set(val);
    this.currentPage.set(1); // Tự động dồn kết quả khớp từ khóa về Trang 1
  }
  onSearchInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchTerm.set(val);
    this.currentPage.set(1);
  }
  onTypeChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedType.set(val);
  }
  onSortChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.sortOrder.set(val);
  }
  onAgeFilterChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedAgeFilter.set(val);
    this.currentPage.set(1);
  }
  // 🌟 HÀM HIỂN THỊ TÊN THỂ LOẠI (HỖ TRỢ CẢ ENUM CŨ VÀ DANH MỤC MỚI ĐỘNG)
  getBookTypeName(type: any): string {
    if (type === null || type === undefined || type === '') return 'Chưa xác định';

    // 1. Nếu type là chuỗi chữ (như "văn học", "Kinh dị"...) -> Trả về chính nó
    if (typeof type === 'string' && isNaN(Number(type))) {
      return type;
    }
    const numericType = Number(type);

    // 2. Tra cứu trong 8 danh mục Enum gốc
    const found = this.bookTypes.find(t => t.value === numericType);
    if (found && found.value !== 0) {
      return found.key;
    }
    // 3. Tra cứu trong bảng danh mục động
    if (this.dynamicCategories().length > numericType && numericType > 0) {
      return this.dynamicCategories()[numericType - 1]?.name || 'Chưa xác định';
    }
    return found ? found.key : 'Chưa xác định';
  }
  async loadWishlist() {
    if (!this.authService.isAuthenticated) return;
    try {
      const ids = await firstValueFrom(this.wishlistService.getMyWishlistBookIds());
      this.wishlistBookIds.set(ids || []);
    } catch (err) {
      console.error('Chưa đăng nhập hoặc lỗi tải wishlist:', err);
    }
  }
  // 💖 HÀM 1-CLICK THẢ TIM / BỎ THÍCH SÁCH
  async toggleWishlist(event: Event, bookId?: string) {
    event.stopPropagation(); // Không kích hoạt mở modal chi tiết sách
    if (!bookId) return;
    try {
      const isAdded = await firstValueFrom(this.wishlistService.toggleWishlist(bookId));
      if (isAdded) {
        this.wishlistBookIds.update(ids => [...ids, bookId]);
      } else {
        this.wishlistBookIds.update(ids => ids.filter(id => id !== bookId));
      }
    } catch (err) {
      console.error('Lỗi khi thả tim:', err);
    }
  }
  isBookInWishlist(bookId?: string): boolean {
    if (!bookId) return false;
    return this.wishlistBookIds().includes(bookId);
  }
  // danh mục sách
  async loadCategories() {
    try {
      const res = await firstValueFrom(this.categoryService.getList({ maxResultCount: 100 }));
      this.dynamicCategories.set(res.items || []);
    } catch (err) {
      console.error('Lỗi tải danh mục động:', err);
    }
  }
  // 🌟 HÀM KIỂM TRA SÁCH MỚI (TRONG VÒNG 7 NGÀY)
  isNewBook(book: any): boolean {
    const bookTime = new Date(book.creationTime || book.publishDate).getTime();
    if (!bookTime) return false;
    const now = new Date().getTime();
    const diffDays = (now - bookTime) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7; // 7 ngày tự động hết
  }

  // 🌟 HÀM PARSE NGÀY AN TOÀN CHUẨN TYPESCRIPT
  private parseDateSafe(dateVal: string | Date | undefined | null): number {
    if (!dateVal) return 0;
    if (dateVal instanceof Date) return dateVal.getTime();
    const parsed = Date.parse(dateVal);
    if (!isNaN(parsed)) return parsed;
    if (typeof dateVal === 'string' && dateVal.includes('/')) {
      const parts = dateVal.split('/');
      if (parts.length === 3) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
      }
    }
    return 0;
  }
}
