import { Routes } from '@angular/router';
import { Homepage } from './homepage/homepage';
import { Firstmap } from './homepage/firstmap/firstmap';
import { Access } from './pages/access/access';
import { Dashboard } from './pages/dashboard/dashboard';
import { authGuard } from './guards/auth.guard';
import { selfIdGuard } from './guards/self-id.guard';

export const routes: Routes = [
{
    path: "",
    component: Homepage
},
{
    path: "firstMap",
    component: Firstmap
},
{
    path: "access",
    component: Access
},
{
    path: "dashboard/:id",
    component: Dashboard,
    canActivate: [authGuard, selfIdGuard]
},

];
