import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequest, RegisterRequest, RegisterResponse, User } from '../models/user.model';
import { BehaviorSubject, catchError, finalize, Observable, of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private baseUrl = '/api/auth';

  private currentUserSubject = new BehaviorSubject<User | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();

  loading = signal(false);
  error = signal<string | null>(null);

  register(payload: RegisterRequest) {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, payload, {withCredentials: true}).pipe(
      catchError(err => {
        this.error.set(err?.error?.msg ?? 'Registrazione Fallita');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    )
  }

  login(payload: LoginRequest) {
    this.loading.set(true)
    this.error.set(null);

    return this.http.post<any>(`${this.baseUrl}/login`, payload, {withCredentials: true}).pipe(
      switchMap(() => this.loadMe()), //controllo i cookie
      tap(user => {
        if (!user) return;
        //navigazione a dashboard id
        this.router.navigate(['/dashboard', user.id]);
      }),
      catchError(err => {
        this.error.set(err?.error?.msg ?? 'Email o Password errate');
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    )
  }

  loadMe(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/me`, {
      withCredentials: true // 
    }).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      })
    );
        
  }

  

  get currentUser(): User | null {
      return this.currentUserSubject.value
    }

    logout() {
  this.http.post(`${this.baseUrl}/logout`, {}, { withCredentials: true })
    .subscribe({
      next: () => {
        this.currentUserSubject.next(null);
        this.router.navigate(['/']);
      },
      error: () => {
        // anche se fallisce, puliamo lo stato locale
        this.currentUserSubject.next(null);
        this.router.navigate(['/']);
      }
    });
}


  
}

