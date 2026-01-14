import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth-service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
 private auth = inject(AuthService);
 private router = inject(Router)

 constructor() {
  this.router.events
    .pipe(filter(e => e instanceof NavigationEnd))
    .subscribe(e => console.log('ROUTE:', (e as NavigationEnd).urlAfterRedirects));
  //tentativo di recuperare l'utente dai cookie
  //this.auth.me().subscribe();
 }
}
