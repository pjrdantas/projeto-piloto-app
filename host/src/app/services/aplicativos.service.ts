/* eslint-disable @angular-eslint/prefer-inject */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, tap, Subject } from 'rxjs';
import { ConfigService } from './config.service';
import { AplicativosRequest } from '../models/aplicativos-request.model';
import { AplicativosResponse } from '../models/aplicativos-response.model';

@Injectable({
  providedIn: 'root'
})
export class AplicativosService {

  loading = false;
  private API = 'aplicativos';

  // 🔥 EVENTO DE ATUALIZAÇÃO
  private _update$ = new Subject<void>();
  update$ = this._update$.asObservable();

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {
    this.API = `${this.configService.getUrlService()}/${this.API}`;
  }

  // 🔥 DISPARA EVENTO
  private notifyUpdate(): void {
    this._update$.next();
  }

  listAll(): Observable<AplicativosResponse[]> {
    this.loading = true;
    return this.http.get<AplicativosResponse[]>(this.API).pipe(
      finalize(() => this.loading = false)
    );
  }

  listActive(): Observable<AplicativosResponse[]> {
    this.loading = true;
    return this.http.get<AplicativosResponse[]>(`${this.API}/ativos`).pipe(
      finalize(() => this.loading = false)
    );
  }

  findById(id: number): Observable<AplicativosResponse> {
    this.loading = true;
    return this.http.get<AplicativosResponse>(`${this.API}/${id}`).pipe(
      finalize(() => this.loading = false)
    );
  }

  create(payload: AplicativosRequest): Observable<AplicativosResponse> {
    this.loading = true;
    return this.http.post<AplicativosResponse>(this.API, payload).pipe(
      tap(() => this.notifyUpdate()), // 🔥 só dispara se sucesso
      finalize(() => this.loading = false)
    );
  }

  update(id: number, payload: AplicativosRequest): Observable<AplicativosResponse> {
    this.loading = true;
    return this.http.put<AplicativosResponse>(`${this.API}/${id}`, payload).pipe(
      tap(() => this.notifyUpdate()), // 🔥
      finalize(() => this.loading = false)
    );
  }

  delete(id: number): Observable<void> {
    this.loading = true;
    return this.http.delete<void>(`${this.API}/${id}`).pipe(
      tap(() => this.notifyUpdate()), // 🔥
      finalize(() => this.loading = false)
    );
  }
}
