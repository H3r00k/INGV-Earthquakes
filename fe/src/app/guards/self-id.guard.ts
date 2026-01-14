import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth-service";
import { User } from "../models/user.model";
import { catchError, map, of } from "rxjs";

export const selfIdGuard: CanActivateFn = (route) => {
    const auth = inject(AuthService);
    const router = inject(Router);


    //id dall'url
    const routeId = Number(route.paramMap.get('id'));

    //utente loggato da authservice
    const decide = (user: User | null) => {
    if (!user) return router.parseUrl('/access');
    if (user.id !== routeId) return router.createUrlTree(['/dashboard', user.id]);
    return true;
  };

  // 1) Se user è già in memoria -> controllo subito
  if (auth.currentUser) {
    return decide(auth.currentUser);
  }

  // 2) Se non è in memoria -> loadMe e poi controllo
  return auth.loadMe().pipe(
    map((user: User | null) => decide(user)),
    catchError(() => of(router.parseUrl('/access')))
  );
};
