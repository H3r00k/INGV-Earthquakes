import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatToolbar } from '@angular/material/toolbar';
import { EarthquakeService } from '../../services/earthquake-service';

@Component({
  selector: 'app-navbar',
  imports: [MatMenu, MatIcon, MatDivider, MatMenuTrigger, MatToolbar],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  auth = inject(AuthService);
  private eq = inject(EarthquakeService);
  private router = inject(Router);

  syncing = signal(false);



  goHome() {
    this.router.navigate(['/']);
  }

  goDashboard(id: number) {
    this.router.navigate(['/dashboard', id]);
  }

  goAccessOrDashboard() {
    const user = this.auth.currentUser;
    if (user) {
      this.goDashboard(user.id);
      return;
    }

    this.auth.loadMe().subscribe(u => {
      if (u) this.goDashboard(u.id);
      else this.router.navigate(['/access']);
    });
  }

  syncNow() {
    this.syncing.set(true);

    this.eq.syncNow().subscribe({
      next: (res) => {
        console.log('SYNC OK', res);
      },
      error: (err) => {
        console.error('SYNC FALLITO', err);
      },
      complete: () => this.syncing.set(false)
    });
  }

  logout() {
    // per dopo: endpoint backend /logout + this.auth.clear()
    this.auth.logout();
  }
}
