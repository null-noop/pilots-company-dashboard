import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CompanyMember } from '../../models/dashboard.models';

interface MemberProfile extends CompanyMember { pid: string; }

@Component({
  imports: [DecimalPipe],
  selector: 'app-members-panel',
  templateUrl: './members-panel.component.html',
})
export class MembersPanelComponent {
  @Input() members: Record<string, CompanyMember> = {};

  protected get profiles(): MemberProfile[] {
    return Object.entries(this.members)
      .map(([pid, member]) => ({ pid, ...member }))
      .sort((left, right) => (right.seen ?? 0) - (left.seen ?? 0));
  }

  protected formatRank(rank: string): string {
    const labels: Record<string, string> = { chief: 'Chief', cpt: 'Captain', fo: 'First officer' };
    return labels[rank] ?? rank;
  }

  protected formatMoney(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  }

  protected formatDateTime(timestamp: number): string {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(timestamp);
  }
}