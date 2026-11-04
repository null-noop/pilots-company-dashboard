import { Component, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { AirResponse, CareerResponse, Company } from './models/dashboard.models';
import { CompanyBookPanelComponent } from './components/company-book-panel/company-book-panel.component';
import { DashboardHeaderComponent } from './components/dashboard-header/dashboard-header.component';
import { CompanySummaryComponent } from './components/company-summary/company-summary.component';
import { FlightsPanelComponent } from './components/flights-panel/flights-panel.component';
import { HoldingsPanelComponent } from './components/holdings-panel/holdings-panel.component';
import { TakenAirportsPanelComponent } from './components/taken-airports-panel/taken-airports-panel.component';
import { FleetPanelComponent } from './components/fleet-panel/fleet-panel.component';
import { ActivityPanelComponent } from './components/activity-panel/activity-panel.component';
import { MembersPanelComponent } from './components/members-panel/members-panel.component';

const API_URL = '/api';
const SYNC_CODE_KEY = 'pilots-company-dashboard-sync-code';
const THEME_KEY = 'pilots-company-dashboard-theme';

@Component({
  encapsulation: ViewEncapsulation.None,
  imports: [ActivityPanelComponent, CompanyBookPanelComponent, CompanySummaryComponent, DashboardHeaderComponent, FleetPanelComponent, FlightsPanelComponent, HoldingsPanelComponent, MembersPanelComponent, TakenAirportsPanelComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly syncCode = signal(localStorage.getItem(SYNC_CODE_KEY) ?? '');
  protected readonly darkMode = signal(localStorage.getItem(THEME_KEY) === 'dark');
  protected readonly company = signal<Company | null>(null);
  protected readonly air = signal<AirResponse | null>(null);
  protected readonly careerMoney = signal<number | null>(null);
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly updatedAt = signal<number | null>(null);
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
      this.careerMoney.set(careerData.career?.money ?? null);
      this.air.set(airData);
      this.updatedAt.set(airData.now ?? Date.now());
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to connect. Check your connection and sync code.');
    } finally {
      this.busy.set(false);
    }
  }
}
