import { Component, Input } from '@angular/core';
import { CompanyBookEntry } from '../../models/dashboard.models';

interface HourTotals {
  hour: number;
  fees: number;
  flight: number;
  upkeep: number;
  transactions: number;
}

interface BookHour extends HourTotals {
  feeHeight: number;
  flightHeight: number;
  upkeepHeight: number;
}

interface BookTotals {
  fees: number;
  flight: number;
  upkeep: number;
  grossIncome: number;
}

@Component({
  selector: 'app-company-book-panel',
  styleUrl: './company-book-panel.component.css',
  templateUrl: './company-book-panel.component.html',
})
export class CompanyBookPanelComponent {
  @Input() entries: CompanyBookEntry[] = [];

  protected get totals(): BookTotals {
    const totals = { fees: 0, flight: 0, upkeep: 0 };
    for (const entry of this.entries) {
      const amount = Number.isFinite(entry.amt) ? entry.amt : 0;
      if (entry.k === 'fee') totals.fees += amount;
      else if (entry.k === 'fly') {
        totals.flight += amount;
        totals.upkeep += Number.isFinite(entry.cost) ? entry.cost ?? 0 : 0;
      }
    }
    return { ...totals, grossIncome: totals.fees + totals.flight };
  }

  protected get hourlyBuckets(): BookHour[] {
    const grouped = new Map<number, HourTotals>();
    for (const entry of this.entries) {
      if (!Number.isFinite(entry.h) || !Number.isFinite(entry.amt)) continue;
      const hour = Math.floor(entry.h);
      const bucket = grouped.get(hour) ?? { hour, fees: 0, flight: 0, upkeep: 0, transactions: 0 };
      if (entry.k === 'fee') bucket.fees += entry.amt;
      else if (entry.k === 'fly') {
        bucket.flight += entry.amt;
        bucket.upkeep += Number.isFinite(entry.cost) ? entry.cost ?? 0 : 0;
      }
      bucket.transactions += Number.isFinite(entry.n) && entry.n > 0 ? entry.n : 1;
      grouped.set(hour, bucket);
    }

    if (!grouped.size) return [];

    const lastHour = Math.max(...grouped.keys());
    const recent = Array.from({ length: 24 }, (_, index) => {
      const hour = lastHour - 23 + index;
      return grouped.get(hour) ?? { hour, fees: 0, flight: 0, upkeep: 0, transactions: 0 };
    });
    const maximum = Math.max(1, ...recent.flatMap((bucket) => [
      bucket.fees, bucket.flight, bucket.upkeep,
    ]));

    return recent.map((bucket) => ({
      ...bucket,
      feeHeight: bucket.fees / maximum * 100,
      flightHeight: bucket.flight / maximum * 100,
      upkeepHeight: bucket.upkeep / maximum * 100,
    }));
  }

  protected formatHour(hour: number): string {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric' }).format(new Date(hour * 3_600_000));
  }

  protected formatTick(hour: number): string {
    return new Date(hour * 3_600_000).getHours() % 6 === 0 ? this.formatHour(hour) : '';
  }

  protected formatHourTitle(bucket: BookHour): string {
    const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric' })
      .format(new Date(bucket.hour * 3_600_000));
    return `${date}: fees ${this.formatMoney(bucket.fees)}, flight revenue ${this.formatMoney(bucket.flight)}, upkeep ${this.formatMoney(bucket.upkeep)}; ${bucket.transactions} transactions`;
  }

  protected formatMoney(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  }
}