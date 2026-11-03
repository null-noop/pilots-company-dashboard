import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Company, CompanyFlight, Holding } from '../../models/dashboard.models';

@Component({
  imports: [DecimalPipe],
  selector: 'app-company-summary',
  templateUrl: './company-summary.component.html',
})
export class CompanySummaryComponent {
  @Input({ required: true }) company!: Company;
  @Input() flights: CompanyFlight[] = [];
  @Input() held: Record<string, Holding> = {};
  @Input() updatedAt: number | null = null;

  protected get memberCount(): number {
    return Object.keys(this.company.members).length;
  }

  protected get holdingCount(): number {
    return Object.keys(this.held).length;
  }

  protected get heldValue(): number {
    return Object.values(this.held).reduce((total, holding) => total + holding.v, 0);
  }

  protected formatMoney(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  }

  protected formatTime(timestamp: number): string {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(timestamp);
  }
}