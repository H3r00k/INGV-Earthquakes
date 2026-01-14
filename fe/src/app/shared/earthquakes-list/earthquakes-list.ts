import { Component, computed, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBar, MatProgressBarModule } from '@angular/material/progress-bar';
import { EarthquakeService } from '../../services/earthquake-service';
import { Earthquake } from '../../models/earthquake.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-earthquakes-list',
  standalone: true,
  imports: [MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,],
  templateUrl: './earthquakes-list.html',
  styleUrl: './earthquakes-list.scss',
})
export class EarthquakesList {
  private eq = inject(EarthquakeService)

  loading = signal(false);
  error = signal<string | null>(null)

  //filtri per la ui
  hours = signal<number>(24);
  minMag = signal<number>(0);
  limit = signal<number>(200);


  data = signal<Earthquake[]>([]);

  hasData = computed(() => this.data().length > 0);


  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loading.set(true);
    this.error.set(null);

    this.eq.list({
      hours: this.hours(),
      minMag: this.minMag(),
      limit: this.limit(),
    }).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (rows) => this.data.set(rows),
      error: () => this.error.set('Errore nel recupero terremoti')
    });
  }

  // UI helper: classe “severity” in base alla magnitudo
  magClass(mag: number | null) {
    if (mag == null) return 'm-unknown';
    if (mag >= 5) return 'm-5';
    if (mag >= 4) return 'm-4';
    if (mag >= 3) return 'm-3';
    if (mag >= 2) return 'm-2';
    return 'm-1';
  }

  formatTime(iso: string) {
    // ISO -> string leggibile (senza librerie)
    // (poi se vuoi lo rendiamo “locale Italia”)
    return iso.replace('T', ' ').split('.')[0];
  }

}
