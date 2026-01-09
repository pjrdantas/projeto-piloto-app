import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, map } from 'rxjs';
import { ConfigService } from './config.service';
import { AplicativosRequest } from '../models/aplicativos-request.model';
import { AplicativosResponse } from '../models/aplicativos-response.model';

@Injectable({
  providedIn: 'root'
})
export class AplicativosService {

  loading = false;
  private API = 'aplicativos';

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.API = `${this.configService.getUrlService()}/${this.API}`;
  }

  // Helper para converter "S"/"N" em boolean
  toBoolean(value: 'S' | 'N'): boolean {
    return value === 'S';
  }

  // Helper para converter boolean em "S"/"N"
  toString(value: boolean): 'S' | 'N' {
    return value ? 'S' : 'N';
  }

  listAll(): Observable<AplicativosResponse[]> {
    this.loading = true;
    return this.http.get<AplicativosResponse[]>(this.API).pipe(
      map(data =>
        data.map(m => ({
          ...m,
          ativo: m.ativo // mantém como string "S" | "N"
        }))
      ),
      finalize(() => this.loading = false)
    );
  }

  findById(id: number): Observable<AplicativosResponse> {
    this.loading = true;
    return this.http.get<AplicativosResponse>(`${this.API}/${id}`).pipe(
      finalize(() => this.loading = false)
    );
  }

  create(payload: {
    nome: string;
    descricao?: string;
    url: string;
    moduleName: string;
    exposedModule: string;
    routePath?: string;
    ativo?: boolean; // boolean local
  }): Observable<AplicativosResponse> {
    const requestPayload: AplicativosRequest = {
      nome: payload.nome,
      descricao: payload.descricao || '',
      url: payload.url,
      moduleName: payload.moduleName,
      exposedModule: payload.exposedModule,
      routePath: payload.routePath || '',
      ativo: this.toString(payload.ativo ?? true) // converte para "S"/"N"
    };

    this.loading = true;
    return this.http.post<AplicativosResponse>(this.API, requestPayload).pipe(
      finalize(() => this.loading = false)
    );
  }

  update(id: number, payload: {
    nome: string;
    descricao?: string;
    url: string;
    moduleName: string;
    exposedModule: string;
    routePath?: string;
    ativo?: boolean;
  }): Observable<AplicativosResponse> {
    const requestPayload: AplicativosRequest = {
      nome: payload.nome,
      descricao: payload.descricao || '',
      url: payload.url,
      moduleName: payload.moduleName,
      exposedModule: payload.exposedModule,
      routePath: payload.routePath || '',
      ativo: this.toString(payload.ativo ?? true) // converte para "S"/"N"
    };

    this.loading = true;
    return this.http.put<AplicativosResponse>(`${this.API}/${id}`, requestPayload).pipe(
      finalize(() => this.loading = false)
    );
  }

  delete(id: number): Observable<void> {
    this.loading = true;
    return this.http.delete<void>(`${this.API}/${id}`).pipe(
      finalize(() => this.loading = false)
    );
  }
}
