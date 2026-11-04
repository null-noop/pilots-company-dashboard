import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CompanyTaken } from '../../models/dashboard.models';

@Component({
  imports: [DatePipe],
  selector: 'app-taken-airports-panel',
  styleUrl: './taken-airports-panel.component.css',
  templateUrl: './taken-airports-panel.component.html',
})
export class TakenAirportsPanelComponent {
  @Input() taken: CompanyTaken[] = [];

  protected get recentTaken(): CompanyTaken[] {
    return [...this.taken].sort((left, right) => right.t - left.t);
  }
}