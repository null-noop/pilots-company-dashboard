import { Component, Input } from '@angular/core';
import { Company } from '../../models/dashboard.models';

@Component({
  selector: 'app-fleet-panel',
  templateUrl: './fleet-panel.component.html',
})
export class FleetPanelComponent {
  @Input() fleet: Company['fleet'] = [];
}