import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { AuthStateService, UsuarioAuth } from '../../core/auth/auth-state.service';


import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    MatToolbarModule,
    MatDividerModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatButtonModule
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {

  usuario: UsuarioAuth | null = null;
  dataHoraFormatada = '';
  private timer!: any;

  constructor(
    private router: Router,
    public authState: AuthStateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.usuario = this.authState.getUsuario();
    this.authState.usuario$.subscribe(u => {
      this.usuario = u;
      this.cdr.detectChanges();
    });

    this.atualizarDataHora();
    this.timer = setInterval(() => {
      this.atualizarDataHora();
      this.cdr.detectChanges();
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  private atualizarDataHora() {
    const agora = new Date();
    this.dataHoraFormatada =
      agora.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) +
      ' - ' +
      agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  irUsuarios() { this.router.navigate(['/usuarios']); }
  irHome() { this.router.navigate(['/app/home']); }
  irAplicativos() { this.router.navigate(['/app/aplicativos']); }
  abrirMicrofrontend() { this.router.navigate(['/app/microfrontend']); }

  sair() { this.authState.clear(); this.router.navigate(['/login']); }
}
