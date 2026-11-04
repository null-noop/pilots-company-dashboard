import { Component, Input } from '@angular/core';

interface ActivityEntry {
  t: number;
  text: string;
}
interface ActivityMoney {
  before: string;
  amount: string;
  after: string;
  direction: 'in' | 'out' | 'neutral';
}

@Component({
  selector: 'app-activity-panel',
  templateUrl: './activity-panel.component.html',
})
export class ActivityPanelComponent {
  @Input() entries: ActivityEntry[] = [];

  protected formatTime(timestamp: number): string {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(
      timestamp,
    );
  }

  protected formatDate(timestamp: number): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(timestamp);
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
        : /\bbought\b/i.test(text)
          ? 'out'
          : 'neutral',
    };
  }
}
