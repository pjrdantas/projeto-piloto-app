import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, NgZone, Type } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, AsyncPipe } from '@angular/common';
import { AuthStateService, UsuarioAuth } from '../../core/auth/auth-state.service';
import { AplicativosService } from '../../services/aplicativos.service';
import { AplicativosResponse } from '../../models/aplicativos-response.model';
import { loadRemoteModule } from '@angular-architects/native-federation';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    RouterModule,
    MatToolbarModule,
    MatDividerModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatButtonModule,
    MatSnackBarModule,
    HasPermissionDirective
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {

  private router = inject(Router);
  public authState = inject(AuthStateService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  private aplicativosService = inject(AplicativosService);
  private snackBar = inject(MatSnackBar);

  usuario: UsuarioAuth | null = null;
  dataHoraFormatada = '';
  aplicativosAtivos: AplicativosResponse[] = [];
  private timerId: ReturnType<typeof window.setInterval> | null = null;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.usuario = this.authState.getUsuario();

    this.authState.usuario$
      .pipe(takeUntil(this.destroy$))
      .subscribe((u) => {
        this.usuario = u;
        this.cdr.detectChanges();
      });

    this.carregarAplicativosAtivos();

    this.aplicativosService.update$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.carregarAplicativosAtivos());

    this.atualizarDataHora();

    this.zone.runOutsideAngular(() => {
      this.timerId = window.setInterval(() => {
        this.atualizarDataHora();
        this.zone.run(() => this.cdr.detectChanges());
      }, 1000);
    });
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      window.clearInterval(this.timerId);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  private carregarAplicativosAtivos(): void {
    this.aplicativosService.listActive()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (apps) => {
          this.aplicativosAtivos = apps;
          this.registrarRotasMicrofrontend(apps);
          this.cdr.detectChanges();
        },
        error: () => this.aplicativosAtivos = []
      });
  }

  private isMicrofrontend(app: AplicativosResponse): boolean {
    return !!(app.url?.trim() && (app.exposedModule?.trim() || app.moduleName?.trim()));
  }

  private normalizarRoutePath(routePath: string): string {
    return (routePath || '').trim().replace(/^\/+/, '').replace(/^app\//i, '');
  }

  private carregarComponenteRemoto(
    remoteEntry: string,
    exposedModule: string
  ): Promise<Type<unknown>> {
    return loadRemoteModule({ remoteEntry, exposedModule })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((m: any) => m['HomeComponent'] || m['AppComponent'] || m['App'])
      .catch((erro) => {
        this.snackBar.open('Microfrontend não encontrado.', 'Fechar', { duration: 3500 });
        this.router.navigate(['/app/home']);
        throw erro;
      });
  }

  private registrarRotasMicrofrontend(apps: AplicativosResponse[]): void {
    const rotaApp = this.router.config.find(r => r.path === 'app');
    if (!rotaApp?.children) return;

    let alterou = false;

    apps.filter(a => this.isMicrofrontend(a)).forEach(app => {
      const path = this.normalizarRoutePath(app.routePath) || `mfe-${app.id}`;
      this.upsertRotaMicrofrontend(path, app.url, app.exposedModule);
      alterou = true;
    });

    if (alterou) {
      this.router.resetConfig([...this.router.config]);
    }
  }

  private upsertRotaMicrofrontend(path: string, remoteEntry: string, exposedModule: string): void {
    const rotaApp = this.router.config.find(r => r.path === 'app');
    if (!rotaApp?.children) return;

    const existente = rotaApp.children.find(r => r.path === path);

    if (existente) {
      existente.loadComponent = () => this.carregarComponenteRemoto(remoteEntry, exposedModule);
      return;
    }

    rotaApp.children.push({
      path,
      loadComponent: () => this.carregarComponenteRemoto(remoteEntry, exposedModule)
    });
  }

  // 🔥 ESSENCIAL (faltava)
  getIconeApp(app: AplicativosResponse): string {
    return this.isMicrofrontend(app) ? 'widgets' : 'open_in_new';
  }

  navegarApp(app: AplicativosResponse): void {
    if (this.isMicrofrontend(app)) {

      const path = this.normalizarRoutePath(app.routePath) || `mfe-${app.id}`;

      if (!app.exposedModule) {
        this.snackBar.open('Exposed Module não informado.', 'Fechar', { duration: 3500 });
        return;
      }

      this.upsertRotaMicrofrontend(path, app.url, app.exposedModule);
      this.router.resetConfig([...this.router.config]);

      this.router.navigate(['/app', path]);

    } else if (app.routePath) {
      this.router.navigate([app.routePath]);

    } else if (app.url?.startsWith('http')) {
      window.open(app.url, '_blank');
    }
  }

  irUsuarios() { this.router.navigate(['/app/usuarios']); }
  irPerfis() { this.router.navigate(['/app/perfis']); }
  irPermissoes() { this.router.navigate(['/app/permissoes']); }
  irAplicativos() { this.router.navigate(['/app/aplicativos']); }
  irHome() { this.router.navigate(['/app/home']); }

  sair(): void {
    this.authState.clear();
    this.router.navigate(['/login']);
  }

  private atualizarDataHora(): void {
    const agora = new Date();
    this.dataHoraFormatada =
      agora.toLocaleDateString('pt-BR') + ' - ' +
      agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}
