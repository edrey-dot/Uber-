import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register-client',
    loadComponent: () =>
      import('./pages/auth/register-client/register-client.page').then((m) => m.RegisterClientPage),
  },
  {
    path: 'client/home',
    loadComponent: () =>
      import('./pages/client/client-home/client-home.page').then((m) => m.ClientHomePage),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
