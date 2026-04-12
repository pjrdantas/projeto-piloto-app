/* eslint-disable @typescript-eslint/array-type */
import { Routes } from '@angular/router';
import { Type } from '@angular/core';
import { authGuard } from './guards/auth.guard';
import { loadRemoteModule } from '@angular-architects/native-federation';

import { PublicLayoutComponent } from './layouts/public-layout.component';
import { PrivateLayoutComponent } from './layouts/private-layout.component';
import { HomeComponent } from './pages/home/home.component';

function carregarHomeMicrofrontend(): Promise<Type<unknown>> {
  const extrairComponente = (m: Record<string, unknown>): Type<unknown> => {
    const componente = m['HomeComponent'] || m['AppComponent'];
    if (!componente) {
      throw new Error("Export de componente nao encontrado no remote.");
    }
    return componente as Type<unknown>;
  };

  const tentativas: Array<() => Promise<Record<string, unknown>>> = [
    () => loadRemoteModule({ remoteEntry: 'http://localhost:4201/remoteEntry.json', exposedModule: './Component' }),
    () => loadRemoteModule({ remoteEntry: 'http://localhost:4201/remoteEntry.js', exposedModule: './Component' }),
    () => loadRemoteModule({ remoteEntry: 'http://localhost:4201/remoteEntry.js', exposedModule: 'mfe1' }),
    () => loadRemoteModule('mfe1', './Component'),
    () => loadRemoteModule('microfrontend', './Component'),
  ];

  const tentar = (indice: number): Promise<Type<unknown>> => {
    if (indice >= tentativas.length) {
      return Promise.reject(new Error('Falha ao carregar o microfrontend.'));
    }

    return tentativas[indice]()
      .then((m) => extrairComponente(m))
      .catch(() => tentar(indice + 1));
  };

  return tentar(0);
}

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
          import('./pages/perfis/perfis.componet')
            .then(m => m.PerfisComponent),
      },
       {
        path: 'permissoes',
        loadComponent: () =>
          import('./pages/permissoes/permissoes.component')
            .then(m => m.PermissoesComponent),
      },
       {
        path: 'usuarios',
        loadComponent: () =>
          import('./pages/usuarios/usuarios.component')
            .then(m => m.UsuariosComponent),
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
          carregarHomeMicrofrontend()
      },
      { path: '**', redirectTo: 'home' },
    ],
  }
  ,

  { path: '**', redirectTo: 'login' },
];
