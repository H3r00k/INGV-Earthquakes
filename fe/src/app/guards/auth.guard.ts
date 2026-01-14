import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth-service";
import { catchError, map, of, retry, throwError } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";


export const authGuard: CanActivateFn = () => {
    const auth = inject(AuthService)
    const router = inject(Router);

    //controllo utente in memoria
    if (auth.currentUser) {
        return true;
        
    }

 return auth.loadMe().pipe(
    
    map(user => user ? true : router.parseUrl('/access')),
    catchError(() => of(router.parseUrl('/access')))
  );
}