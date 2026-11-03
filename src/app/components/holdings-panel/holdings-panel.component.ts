import { DecimalPipe } from '@angular/common';
import { Component, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Holding } from '../../models/dashboard.models';

type HoldingSort = 'code' | 'value';
type SortDirection = 'asc' | 'desc';
interface HoldingRow { code: string; value: number; lat: number; lon: number; }

@Component({
  imports: [DecimalPipe, FormsModule],
  selector: 'app-holdings-panel',
  templateUrl: './holdings-panel.component.html',
})
export class HoldingsPanelComponent {
  @Input() held: Record<string, Holding> = {};

  protected readonly search = signal('');
  protected readonly sort = signal<HoldingSort>('value');
  protected readonly direction = signal<SortDirection>('desc');
  protected readonly page = signal(0);
  protected readonly pageSize = 8;

  protected get holdings(): HoldingRow[] {
    return Object.entries(this.held)
      .map(([code, holding]) => ({ code, value: holding.v, lat: holding.lat, lon: holding.lon }))
      .sort((left, right) => right.value - left.value);
  }

  protected get filteredHoldings(): HoldingRow[] {
    const query = this.search().trim().toUpperCase();
    const direction = this.direction() === 'asc' ? 1 : -1;

    return this.holdings
      .filter((holding) => holding.code.toUpperCase().includes(query))
      .sort((left, right) => {
        const comparison = this.sort() === 'code'
          ? left.code.localeCompare(right.code)
          : left.value - right.value;
        return comparison * direction;
      });
  }

  protected get paginatedHoldings(): HoldingRow[] {
    const start = this.page() * this.pageSize;
    return this.filteredHoldings.slice(start, start + this.pageSize);
  }

  protected get rangeStart(): number {
    return this.filteredHoldings.length ? this.page() * this.pageSize + 1 : 0;
  }

  protected get rangeEnd(): number {
    return Math.min((this.page() + 1) * this.pageSize, this.filteredHoldings.length);
  }

  protected get pageCount(): number {
    return Math.ceil(this.filteredHoldings.length / this.pageSize);
  }

  protected setSearch(query: string): void {
    this.search.set(query);
    this.page.set(0);
  }

  protected setSort(sort: HoldingSort): void {
    this.sort.set(sort);
    this.direction.set(sort === 'code' ? 'asc' : 'desc');
    this.page.set(0);
  }

  protected toggleDirection(): void {
    this.direction.update((direction) => direction === 'asc' ? 'desc' : 'asc');
    this.page.set(0);
  }

  protected previousPage(): void {
    this.page.update((page) => Math.max(0, page - 1));
  }

  protected nextPage(): void {
    this.page.update((page) => Math.min(page + 1, Math.max(0, this.pageCount - 1)));
  }

  protected formatMoney(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  }
}