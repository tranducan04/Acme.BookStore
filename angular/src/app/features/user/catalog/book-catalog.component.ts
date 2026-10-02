import { Component, inject, OnInit, signal, computed, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@abp/ng.core';
import { BookService } from '@proxy/books';
import { CategoryService } from '../../../proxy/categories/category.service';
import { AuthorService } from '../../../proxy/authors/author.service';
import { WishlistService } from '../../../proxy/wishlists/wishlist.service';
import { CartSignalStore } from '../Carts/cart-signal.store';
import { ToastService } from '../../../shared/services/toast.service';
import { StorefrontBook, CatalogFilterState, formatAgeLimit } from '../../../shared/models/storefront.models';
import { BookCardComponent } from '../../../shared/components/storefront/book-card/book-card.component';
import { SearchBarComponent } from '../../../shared/components/storefront/search-bar/search-bar.component';
import { LoadingSkeletonComponent } from '../../../shared/components/storefront/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../shared/components/storefront/empty-state/empty-state.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-book-catalog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    BookCardComponent,
    SearchBarComponent,
    LoadingSkeletonComponent,
    EmptyStateComponent
  ],
  templateUrl: './book-catalog.component.html',
  styleUrls: ['./book-catalog.component.scss']
})
export class BookCatalogComponent implements OnInit {
  // Storefront catalog component
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookService = inject(BookService);
  private readonly categoryService = inject(CategoryService);
  private readonly authorService = inject(AuthorService);
  private readonly wishlistService = inject(WishlistService);
  readonly cartStore = inject(CartSignalStore);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);

  readonly isLoading = signal<boolean>(true);
  readonly allBooks = signal<StorefrontBook[]>([]);
  readonly categories = signal<{ id: string; name: string }[]>([]);
  readonly authors = signal<{ id: string; name: string }[]>([]);
  readonly wishlistBookIds = signal<Set<string>>(new Set());

  // Filter state
  readonly filter = signal<CatalogFilterState>({
    searchQuery: '',
    categoryId: undefined,
    authorId: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    ageLimit: undefined,
    inStockOnly: false,
    sortBy: 'newest',
    page: 1,
    pageSize: 12,
    totalCount: 0
  });

  // Price range options
  readonly priceRanges = [
    { label: 'Tất cả mức giá', min: undefined, max: undefined },
    { label: 'Dưới 100,000₫', min: 0, max: 100000 },
    { label: '100,000₫ - 250,000₫', min: 100000, max: 250000 },
    { label: '250,000₫ - 500,000₫', min: 250000, max: 500000 },
    { label: 'Trên 500,000₫', min: 500000, max: undefined }
  ];

  selectedPriceRange = signal<number>(0);

  // Custom Dropdowns State
  readonly isCategoryOpen = signal<boolean>(false);
  readonly isPriceOpen = signal<boolean>(false);
  readonly isSortOpen = signal<boolean>(false);
  readonly isPageSizeOpen = signal<boolean>(false);

  readonly sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'bestSeller', label: 'Bán chạy nhất' },
    { value: 'priceAsc', label: 'Giá tăng dần' },
    { value: 'priceDesc', label: 'Giá giảm dần' }
  ];

  readonly pageSizeOptions = [12, 24, 48];

  readonly selectedCategoryName = computed(() => {
    const catId = this.filter().categoryId;
    if (!catId) return 'Tất cả thể loại';
    const cat = this.categories().find(c => c.id === catId);
    return cat ? cat.name : 'Tất cả thể loại';
  });

  readonly selectedPriceRangeLabel = computed(() => {
    const idx = this.selectedPriceRange();
    return this.priceRanges[idx]?.label || 'Tất cả mức giá';
  });

  readonly selectedSortLabel = computed(() => {
    const s = this.filter().sortBy;
    return this.sortOptions.find(o => o.value === s)?.label || 'Mới nhất';
  });

  readonly selectedPageSizeLabel = computed(() => {
    return `${this.filter().pageSize} / trang`;
  });

  // Age limits
  readonly ageLimits = ['Tất cả', 'Thiếu nhi', 'Thiếu niên', 'Trưởng thành'];

  // Filtered & Paginated books computed
  readonly filteredBooks = computed(() => {
    let list = [...this.allBooks()];
    const f = this.filter();

    // 1. Search Query (Chỉ tìm theo tên sách và tác giả)
    if (f.searchQuery) {
      const q = f.searchQuery.toLowerCase();
      list = list.filter(b =>
        b.name.toLowerCase().includes(q) ||
        (b.authorName && b.authorName.toLowerCase().includes(q))
      );
    }

    // 2. Category
    if (f.categoryId) {
      list = list.filter(b => b.categoryId === f.categoryId);
    }

    // 3. Author
    if (f.authorId) {
      list = list.filter(b => b.authorId === f.authorId);
    }

    // 4. Price
    if (f.minPrice !== undefined) {
      list = list.filter(b => b.price >= f.minPrice!);
    }
    if (f.maxPrice !== undefined) {
      list = list.filter(b => b.price <= f.maxPrice!);
    }

    // 5. Age Limit
    if (f.ageLimit && f.ageLimit !== 'Tất cả') {
      list = list.filter(b => b.ageLimit === f.ageLimit);
    }

    // 6. In Stock
    if (f.inStockOnly) {
      list = list.filter(b => b.stockCount > 0);
    }

    // 7. Sort
    switch (f.sortBy) {
      case 'priceAsc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'bestSeller':
        list.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      case 'newest':
      default:
        list.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
        break;
    }

    return list;
  });

  readonly totalItems = computed(() => this.filteredBooks().length);
  readonly totalPages = computed(() => Math.ceil(this.totalItems() / this.filter().pageSize) || 1);

  readonly paginatedBooks = computed(() => {
    const f = this.filter();
    const start = (f.page - 1) * f.pageSize;
    return this.filteredBooks().slice(start, start + f.pageSize);
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.filter().page;
    const pages: number[] = [];

    let start = Math.max(1, current - 2);
    let end = Math.min(total, current + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.filter.update(f => ({
        ...f,
        searchQuery: params['filter'] || params['q'] || '',
        categoryId: params['categoryId'] || undefined,
        authorId: params['authorId'] || undefined,
        ageLimit: params['ageLimit'] || undefined,
        inStockOnly: params['inStock'] === 'true' || params['inStockOnly'] === 'true',
        sortBy: params['sortBy'] || 'newest',
        page: params['page'] ? parseInt(params['page'], 10) : 1,
        pageSize: params['pageSize'] ? parseInt(params['pageSize'], 10) : 12
      }));
    });

    this.loadCatalogData();
  }

  async loadCatalogData(): Promise<void> {
    this.isLoading.set(true);
    try {
      await Promise.all([
        this.loadWishlist(),
        this.loadCategories(),
        this.loadAuthors(),
      ]);
      await this.loadBooks();
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadWishlist(): Promise<void> {
    if (this.authService.isAuthenticated) {
      try {
        const ids = await firstValueFrom(this.wishlistService.getMyWishlistBookIds());
        this.wishlistBookIds.set(new Set(ids || []));
      } catch (e) {
        console.error('Lỗi tải wishlist:', e);
      }
    }
  }

  async loadCategories(): Promise<void> {
    try {
      const res = await firstValueFrom(this.categoryService.getList({ maxResultCount: 50, skipCount: 0 }));
      this.categories.set((res.items || []).map(c => ({ id: c.id || '', name: c.name || '' })));
    } catch (e) {
      console.error('Lỗi tải categories:', e);
    }
  }

  async loadAuthors(): Promise<void> {
    try {
      const res = await firstValueFrom(this.authorService.getAuthorLookup());
      this.authors.set((res.items || []).map(a => ({ id: a.id || '', name: a.name || '' })));
    } catch (e) {
      console.error('Lỗi tải authors:', e);
    }
  }

  async loadBooks(): Promise<void> {
    try {
      const res = await firstValueFrom(this.bookService.getList({ maxResultCount: 100, skipCount: 0 }));
      const wishlisted = this.wishlistBookIds();
      const mapped: StorefrontBook[] = (res.items || []).map((b: any) => ({
        id: b.id,
        name: b.name,
        type: b.type,
        categoryName: b.categoryName || 'Sách tổng hợp',
        categoryId: b.categoryId,
        publishDate: b.publishDate,
        price: b.price || 0,
        discountPrice: b.originalPrice && b.originalPrice > b.price ? b.price : undefined,
        authorId: b.authorId,
        authorName: b.authorName,
        coverImage: b.coverImage,
        stockCount: b.stockCount !== undefined && b.stockCount !== null ? Number(b.stockCount) : 0,
        averageRating: 5,
        reviewCount: 0,
        ageLimit: formatAgeLimit(b.ageLimit),
        isWishlisted: wishlisted.has(b.id)
      }));
      this.allBooks.set(mapped);
    } catch (e) {
      console.error('Lỗi tải books:', e);
    }
  }

  onInStockOnlyChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.updateQueryParam({ inStock: checked ? 'true' : null, page: 1 });
  }

  onSearch(query: string): void {
    this.updateQueryParam({ filter: query || null, page: 1 });
  }

  onCategoryChange(catId?: string): void {
    this.updateQueryParam({ categoryId: catId || null, page: 1 });
  }

  onCategorySelectChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.onCategoryChange(val || undefined);
  }

  onAuthorChange(authorId?: string): void {
    this.updateQueryParam({ authorId: authorId || null, page: 1 });
  }

  onPriceRangeChange(index: number): void {
    this.selectedPriceRange.set(index);
    const range = this.priceRanges[index];
    this.filter.update(f => ({
      ...f,
      minPrice: range.min,
      maxPrice: range.max,
      page: 1
    }));
  }

  onPriceRangeSelectChange(event: Event): void {
    const val = parseInt((event.target as HTMLSelectElement).value, 10);
    this.onPriceRangeChange(isNaN(val) ? 0 : val);
  }

  onAgeLimitChange(limit: string): void {
    this.updateQueryParam({ ageLimit: limit === 'Tất cả' ? null : limit, page: 1 });
  }

  onSortChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.updateQueryParam({ sortBy: val, page: 1 });
  }

  onPageSizeChange(event: Event): void {
    const size = parseInt((event.target as HTMLSelectElement).value, 10);
    this.updateQueryParam({ pageSize: size, page: 1 });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.updateQueryParam({ page });
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  toggleCategoryDropdown(event: Event): void {
    event.stopPropagation();
    this.isCategoryOpen.update(v => !v);
    this.isPriceOpen.set(false);
  }

  togglePriceDropdown(event: Event): void {
    event.stopPropagation();
    this.isPriceOpen.update(v => !v);
    this.isCategoryOpen.set(false);
  }

  selectCategory(catId?: string): void {
    this.onCategoryChange(catId);
    this.isCategoryOpen.set(false);
  }

  selectPriceRange(idx: number): void {
    this.onPriceRangeChange(idx);
    this.isPriceOpen.set(false);
  }

  toggleSortDropdown(event: Event): void {
    event.stopPropagation();
    this.isSortOpen.update(v => !v);
    this.isPageSizeOpen.set(false);
    this.isCategoryOpen.set(false);
    this.isPriceOpen.set(false);
  }

  togglePageSizeDropdown(event: Event): void {
    event.stopPropagation();
    this.isPageSizeOpen.update(v => !v);
    this.isSortOpen.set(false);
    this.isCategoryOpen.set(false);
    this.isPriceOpen.set(false);
  }

  selectSort(sortBy: string): void {
    this.updateQueryParam({ sortBy, page: 1 });
    this.isSortOpen.set(false);
  }

  selectPageSize(size: number): void {
    this.updateQueryParam({ pageSize: size, page: 1 });
    this.isPageSizeOpen.set(false);
  }

  @HostListener('document:click')
  closeDropdowns(): void {
    if (this.isCategoryOpen() || this.isPriceOpen() || this.isSortOpen() || this.isPageSizeOpen()) {
      this.isCategoryOpen.set(false);
      this.isPriceOpen.set(false);
      this.isSortOpen.set(false);
      this.isPageSizeOpen.set(false);
    }
  }

  resetFilters(): void {
    this.selectedPriceRange.set(0);
    this.isCategoryOpen.set(false);
    this.isPriceOpen.set(false);
    this.isSortOpen.set(false);
    this.isPageSizeOpen.set(false);
    this.router.navigate(['/books'], { queryParams: {} });
  }

  private updateQueryParam(newParams: Record<string, any>): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: newParams,
      queryParamsHandling: 'merge'
    });
  }

  async onAddToCart(book: StorefrontBook): Promise<void> {
    if (book.stockCount <= 0) {
      this.toastService.showWarning(`Sách "${book.name}" hiện đã hết hàng!`);
      return;
    }
    if (!this.authService.isAuthenticated) {
      this.toastService.showWarning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      this.authService.navigateToLogin();
      return;
    }
    try {
      await this.cartStore.addToCart(book.id, 1);
      this.toastService.showSuccess(`Đã thêm "${book.name}" vào giỏ hàng!`);
    } catch {
      this.toastService.showError('Có lỗi xảy ra khi thêm vào giỏ hàng.');
    }
  }

  async onToggleFavorite(book: StorefrontBook): Promise<void> {
    if (!this.authService.isAuthenticated) {
      this.toastService.showWarning('Vui lòng đăng nhập để lưu sách yêu thích');
      this.authService.navigateToLogin();
      return;
    }
    try {
      const isFav = await firstValueFrom(this.wishlistService.toggleWishlist(book.id));
      const current = this.wishlistBookIds();
      if (isFav) {
        current.add(book.id);
        this.toastService.showSuccess(`Đã lưu "${book.name}" vào yêu thích!`);
      } else {
        current.delete(book.id);
        this.toastService.showInfo(`Đã bỏ "${book.name}" khỏi yêu thích.`);
      }
      this.wishlistBookIds.set(new Set(current));

      // Cập nhật immutably Signal allBooks
      this.allBooks.update(list => list.map(b => b.id === book.id ? { ...b, isWishlisted: isFav } : b));
    } catch {
      this.toastService.showError('Không thể cập nhật danh sách yêu thích.');
      this.allBooks.update(list => list.map(b => b.id === book.id ? { ...b, isWishlisted: book.isWishlisted } : b));
    }
  }

  onViewDetail(bookId: string): void {
    this.router.navigate(['/books', bookId]);
  }
}
