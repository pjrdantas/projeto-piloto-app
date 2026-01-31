import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject, NgZone } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, NgIf, AsyncPipe } from '@angular/common'; // Importes específicos
import { AuthStateService, UsuarioAuth } from '../../core/auth/auth-state.service';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    AsyncPipe, // Essencial para o pipe | async no HTML
    RouterModule,
    MatToolbarModule,
    MatDividerModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatButtonModule,
    HasPermissionDirective
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  public authState = inject(AuthStateService);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone); // Adicione nos injects lá em cima

  usuario: UsuarioAuth | null = null;
  dataHoraFormatada = '';
  private timer!: any;

  ngOnInit(): void {
    // Busca o usuário inicial
    this.usuario = this.authState.getUsuario();

    // Escuta mudanças no usuário
    this.authState.usuario$.subscribe(u => {
      this.usuario = u;
      this.cdr.detectChanges();
    });

    this.atualizarDataHora();

    // Executa o timer fora da "Zona" do Angular para não sobrecarregar o navegador
    this.zone.runOutsideAngular(() => {
      this.timer = setInterval(() => {
        this.atualizarDataHora();

        // Somente esta linha volta para a Zona para atualizar o texto na tela
        this.zone.run(() => {
          this.cdr.detectChanges();
        });
      }, 1000);
    });
  }


  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private atualizarDataHora() {
    const agora = new Date();
    this.dataHoraFormatada =
      agora.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) +
      ' - ' +
      agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  irUsuarios() { this.router.navigate(['/app/usuarios']); }
  irPerfis() { this.router.navigate(['/app/perfis']); }
  irPermissoes() { this.router.navigate(['/app/permissoes']); }
  irAplicativos() { this.router.navigate(['/app/aplicativos']); }
  abrirMicrofrontend() { this.router.navigate(['/app/microfrontend']); }
  irHome() { this.router.navigate(['/app/home']); }
  sair() { this.authState.clear(); this.router.navigate(['/login']); }
}
