import { Injectable } from '@angular/core';
import { AuthStateService } from './auth-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthBootstrapService {

  constructor(private authState: AuthStateService) {}

  init(): void {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const usuarioObj = localStorage.getItem('usuarioObj');

    if (token && refreshToken) {
      let usuario;

      if (usuarioObj) {
        try {
          usuario = JSON.parse(usuarioObj);
        } catch {
          usuario = { usuario: '', nome: '', perfis: [] };
        }
      } else {
        // If no usuarioObj is present, initialize with empty values
        usuario = { usuario: '', nome: '', perfis: [] };
      }

      this.authState.setAuth(
        token,
        refreshToken,
        usuario
      );
    }
  }
}
