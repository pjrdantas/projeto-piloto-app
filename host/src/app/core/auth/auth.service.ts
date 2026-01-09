import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ConfigService } from '../../services/config.service';
import { AuthStateService } from './auth-state.service';

export interface LoginRequest {
  login: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  usuario: string;
  nome: string;
  perfis: string[];
}

export interface RefreshTokenResponse {
  accessToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly BASE_API: string;

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private authState: AuthStateService
  ) {
    this.BASE_API = `${this.configService.getUrlService()}/auth`;
  }

  // ✅ LOGIN
  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.BASE_API}/login`,
      payload
    ).pipe(
      tap(response => {
        this.authState.setAuth(
          response.token,
          response.refreshToken,
          {
            usuario: response.usuario,
            nome: response.nome,
            perfis: response.perfis
          }
        );
      })
    );
  }

  // 🔄 REFRESH TOKEN (somente HTTP)
  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = localStorage.getItem('refreshToken');

    return this.http.post<RefreshTokenResponse>(
      `${this.BASE_API}/refresh-token`,
      { refreshToken }
    );
  }

  // ✅ LOGOUT
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.authState.clear();
  }

  // ⚠️ Uso restrito (guards/interceptor)
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
