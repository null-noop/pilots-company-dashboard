import { DecimalPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Airport {
  code: string;
  name: string;
}

interface CompanyFlight {
  pid: string;
  cs: string;
  type: string;
  reg: string;
  t0: number;
  from: Airport;
  to: Airport;
  eta: number;
}

interface Holding {
  v: number;
  lat: number;
  lon: number;
}

interface CompanyMember {
  cs: string;
  rank: string;
  joined?: number;
  jobs?: number;
  earned?: number;
  seen?: number;
  at?: string;
  gave?: number;
  brought?: number;
}

interface Company {
  id: string;
  name: string;
  tag: string;
  treasury: number;
  members: Record<string, CompanyMember>;
  fleet: Array<{ reg: string; type: string; at: Airport | null }>;
  bases: Array<{ code: string; name: string; gates: number }>;
  log: Array<{ t: number; text: string }>;
  stats: { jobs: number; units: number; earned: number };
}

interface CareerResponse {
  career?: { co?: string; money?: number };
  company?: Company;
}

interface AirResponse {
  now?: number;
  flights?: CompanyFlight[];
  held?: Record<string, Holding>;
}

interface ActivityMoney {
  before: string;
  amount: string;
  after: string;
  direction: 'in' | 'out' | 'neutral';
}

type HoldingSort = 'code' | 'value';
type SortDirection = 'asc' | 'desc';

const API_URL = '/api';
const SYNC_CODE_KEY = 'pilots-company-dashboard-sync-code';
const THEME_KEY = 'pilots-company-dashboard-theme';

@Component({
  imports: [DecimalPipe, FormsModule],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly syncCode = signal(localStorage.getItem(SYNC_CODE_KEY) ?? '');
  protected readonly darkMode = signal(localStorage.getItem(THEME_KEY) === 'dark');
  protected readonly company = signal<Company | null>(null);
  protected readonly air = signal<AirResponse | null>(null);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly updatedAt = signal<number | null>(null);
  protected readonly holdingsSearch = signal('');
  protected readonly holdingsSort = signal<HoldingSort>('value');
  protected readonly holdingsSortDirection = signal<SortDirection>('desc');
  protected readonly holdingsPage = signal(0);
  protected readonly holdingsPageSize = 8;

  protected get heldValue(): number {
    return Object.values(this.air()?.held ?? {}).reduce((total, holding) => total + holding.v, 0);
  }

  protected get memberCount(): number {
    return Object.keys(this.company()?.members ?? {}).length;
  }

  protected get memberProfiles(): Array<CompanyMember & { pid: string }> {
    return Object.entries(this.company()?.members ?? {})
      .map(([pid, member]) => ({ pid, ...member }))
      .sort((left, right) => (right.seen ?? 0) - (left.seen ?? 0));
  }

  protected get holdings(): Array<{ code: string; value: number; lat: number; lon: number }> {
    return Object.entries(this.air()?.held ?? {})
      .map(([code, holding]) => ({ code, value: holding.v, lat: holding.lat, lon: holding.lon }))
      .sort((left, right) => right.value - left.value);
  }

  protected get filteredHoldings(): Array<{ code: string; value: number; lat: number; lon: number }> {
    const query = this.holdingsSearch().trim().toUpperCase();
    const direction = this.holdingsSortDirection() === 'asc' ? 1 : -1;

    return this.holdings
      .filter((holding) => holding.code.toUpperCase().includes(query))
      .sort((left, right) => {
        const comparison = this.holdingsSort() === 'code'
          ? left.code.localeCompare(right.code)
          : left.value - right.value;
        return comparison * direction;
      });
  }

  protected get paginatedHoldings(): Array<{ code: string; value: number; lat: number; lon: number }> {
    const start = this.holdingsPage() * this.holdingsPageSize;
    return this.filteredHoldings.slice(start, start + this.holdingsPageSize);
  }

  protected get holdingsRangeStart(): number {
    return this.filteredHoldings.length ? this.holdingsPage() * this.holdingsPageSize + 1 : 0;
  }

  protected get holdingsRangeEnd(): number {
    return Math.min((this.holdingsPage() + 1) * this.holdingsPageSize, this.filteredHoldings.length);
  }

  protected get holdingsPageCount(): number {
    return Math.ceil(this.filteredHoldings.length / this.holdingsPageSize);
  }

  protected setHoldingsSearch(query: string): void {
    this.holdingsSearch.set(query);
    this.holdingsPage.set(0);
  }

  protected setHoldingsSort(sort: HoldingSort): void {
    this.holdingsSort.set(sort);
    this.holdingsSortDirection.set(sort === 'code' ? 'asc' : 'desc');
    this.holdingsPage.set(0);
  }

  protected toggleHoldingsSortDirection(): void {
    this.holdingsSortDirection.update((direction) => direction === 'asc' ? 'desc' : 'asc');
    this.holdingsPage.set(0);
  }

  protected previousHoldingsPage(): void {
    this.holdingsPage.update((page) => Math.max(0, page - 1));
  }

  protected nextHoldingsPage(): void {
    this.holdingsPage.update((page) => Math.min(page + 1, Math.max(0, this.holdingsPageCount - 1)));
  }

  ngOnInit(): void {
    this.applyTheme();
    if (this.syncCode().trim()) void this.connect();
  }

  protected toggleTheme(): void {
    this.darkMode.update((enabled) => !enabled);
    localStorage.setItem(THEME_KEY, this.darkMode() ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme(): void {
    document.documentElement.dataset['theme'] = this.darkMode() ? 'dark' : 'light';
  }

  protected async connect(): Promise<void> {
    const code = this.syncCode().trim();
    if (!code) {
      this.error.set('Enter your sync code to connect.');
      return;
    }

    this.busy.set(true);
    this.error.set('');
    try {
      const careerResponse = await fetch(`${API_URL}/career`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ op: 'co.get', acct: code }),
      });
      if (!careerResponse.ok) throw new Error(`Career request failed (${careerResponse.status}).`);

      const careerData = await careerResponse.json() as CareerResponse;
      const companyId = careerData.career?.co;
      if (!companyId || !careerData.company) {
        throw new Error('No company is linked to this sync code.');
      }

      const airResponse = await fetch(`${API_URL}/air/${encodeURIComponent(`co${companyId}`)}`);
      if (!airResponse.ok) throw new Error(`Flight request failed (${airResponse.status}).`);
      const airData = await airResponse.json() as AirResponse;

      localStorage.setItem(SYNC_CODE_KEY, code);
      this.syncCode.set(code);
      this.company.set(careerData.company);
      this.air.set(airData);
      this.updatedAt.set(airData.now ?? Date.now());
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to connect. Check your connection and sync code.');
    } finally {
      this.busy.set(false);
    }
  }

  protected formatMoney(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  }

  protected formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  protected remainingFlightSeconds(flight: CompanyFlight): number {
    const now = this.air()?.now ?? Date.now();
    return Math.max(0, Math.ceil(flight.eta - (now - flight.t0) / 1000));
  }

  protected formatTime(timestamp: number): string {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(timestamp);
  }

  protected formatDate(timestamp: number): string {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(timestamp);
  }

  protected activityMoney(text: string): ActivityMoney | null {
    const match = /\$[\d,]+(?:\.\d{2})?/.exec(text);
    if (!match || match.index === undefined) return null;

    const amount = match[0];
    return {
      before: text.slice(0, match.index),
      amount,
      after: text.slice(match.index + amount.length),
      direction: /\b(?:put in|contributed|deposited|received|earned|sold)\b/i.test(text)
        ? 'in'
        : /\bbought\b/i.test(text) ? 'out' : 'neutral',
    };
  }

  protected formatDateTime(timestamp: number): string {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(timestamp);
  }

  protected formatRank(rank: string): string {
    const labels: Record<string, string> = { chief: 'Chief', cpt: 'Captain', fo: 'First officer' };
    return labels[rank] ?? rank;
  }
}
