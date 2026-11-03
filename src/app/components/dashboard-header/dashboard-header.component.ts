import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-dashboard-header',
  styleUrl: './dashboard-header.component.css',
  templateUrl: './dashboard-header.component.html',
})
export class DashboardHeaderComponent {
  @Input() syncCode = '';
  @Input() busy = false;
  @Input() connected = false;
  @Input() darkMode = false;

  @Output() readonly syncCodeChange = new EventEmitter<string>();
  @Output() readonly connectRequested = new EventEmitter<void>();
  @Output() readonly themeToggle = new EventEmitter<void>();
}