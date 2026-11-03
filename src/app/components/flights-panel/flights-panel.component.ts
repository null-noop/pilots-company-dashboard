import { Component, Input } from '@angular/core';
import { CompanyFlight } from '../../models/dashboard.models';

@Component({
  selector: 'app-flights-panel',
  templateUrl: './flights-panel.component.html',
})
export class FlightsPanelComponent {
  @Input() flights: CompanyFlight[] = [];
  @Input() now: number | undefined;

  protected remainingFlightSeconds(flight: CompanyFlight): number {
    return Math.max(0, Math.ceil(flight.eta - ((this.now ?? Date.now()) - flight.t0) / 1000));
  }

  protected formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
  }
}