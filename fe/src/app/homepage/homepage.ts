import { Component, inject } from '@angular/core';
import { MatCard, MatCardActions, MatCardContent, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-homepage',
  imports: [MatCard, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions, RouterLink],
  templateUrl: './homepage.html',
  styleUrl: './homepage.scss',
})
export class Homepage {
private auth = inject(AuthService);
private router = inject(Router);
  // Nel tuo component.ts (login.component.ts o hero.component.ts)
backgroundUrl = '/assets/images/lava-bg.jpg';


goToAccessOrDashboard() {
  const user = this.auth.currentUser;

  if(user){
    this.router.navigate(['/dashboard', user.id])
    return
  }

  this.auth.loadMe().subscribe({
    next: u => this.router.navigate(['/dashboard', u.id]),
    error: (err) => {
      if (err?.status === 401) this.router.navigate(['/access']);
      else this.router.navigate(['/access']); //pagina di errore da stilizzare
      //this.router.navigate(['/access'])
    }
  })

}



}
