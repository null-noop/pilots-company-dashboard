import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the sync code connection form', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('label[for="sync-code"]')?.textContent).toContain('Sync code');
    expect(compiled.querySelector('.sync-note')?.textContent).toContain('Saved only in this browser');
    expect(compiled.querySelector('button[type="submit"]')?.textContent).toContain('Connect');
  });

  it('should toggle and persist the page theme', async () => {
    localStorage.removeItem('pilots-company-dashboard-theme');
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const toggle = fixture.nativeElement.querySelector('.theme-toggle') as HTMLButtonElement;

    toggle.click();
    await fixture.whenStable();

    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(document.documentElement.dataset['theme']).toBe('dark');
    expect(localStorage.getItem('pilots-company-dashboard-theme')).toBe('dark');
  });
});
