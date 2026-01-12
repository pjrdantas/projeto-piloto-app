import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { loadRemoteModule } from '@angular-architects/native-federation';

import { PublicLayoutComponent } from './layouts/public-layout.component';
import { PrivateLayoutComponent } from './layouts/private-layout.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [

  // ================= PUBLICO =================
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/login/login.component')
            .then(m => m.LoginComponent),
      },
    ],
  },

  // ================= PRIVADO =================
  {
    path: 'app',
    component: PrivateLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' }, // redireciona para /app/home
      { path: 'home', component: HomeComponent },         // página inicial limpa

       {
        path: 'perfis',
        loadComponent: () =>
          import('./pages/perfis/perfis')
            .then(m => m.Perfis),
      },
       {
        path: 'permissoes',
        loadComponent: () =>
          import('./pages/permissoes/permissoes')
            .then(m => m.Permissoes),
      },
       {
        path: 'usuarios',
        loadComponent: () =>
          import('./pages/usuarios/usuarios')
            .then(m => m.Usuarios),
      },
      {
        path: 'aplicativos',
        loadComponent: () =>
          import('./pages/aplicativos/aplicativos.component')
            .then(m => m.AplicativosComponent),
      },
      {
        path: 'microfrontend',
        loadComponent: () =>
          loadRemoteModule('mfe1', './Component')
            .then((m) => m.HomeComponent)
      },
    ],
  }
  ,

  { path: '**', redirectTo: 'login' },
];
