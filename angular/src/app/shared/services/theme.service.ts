import { Injectable, signal, effect } from '@angular/core';
import { ThemeMode } from '../models/storefront.models';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'bookstore_theme';
  readonly currentTheme = signal<ThemeMode>('light');

  constructor() {
    const savedTheme = (typeof localStorage !== 'undefined' ? localStorage.getItem(this.STORAGE_KEY) : null) as ThemeMode;
    const initialTheme: ThemeMode = savedTheme === 'dark' ? 'dark' : 'light';
    this.currentTheme.set(initialTheme);
    this.applyTheme(initialTheme);

    effect(() => {
      const mode = this.currentTheme();
      this.applyTheme(mode);
    });
  }

  toggleTheme(): void {
    const nextMode: ThemeMode = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(nextMode);
  }

  setTheme(mode: ThemeMode): void {
    this.currentTheme.set(mode);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, mode);
    }
  }

  private applyTheme(mode: ThemeMode): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', mode);
      if (mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
}
