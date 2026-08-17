import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then((c) => c.HomeComponent) 
    },
    {
        path: 'auth',
        loadComponent: () => import('./layout/auth/auth.component').then((c) => c.AuthComponent),
        children: [
            {
                path: 'login',
                loadComponent: () => import('./layout/auth/login/login.component').then((c) => c.LoginComponent),
            }
        ] 
    }
];
