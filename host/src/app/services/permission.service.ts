import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Permission {  // exportando a interface
  id: number;
  nome: string;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private baseUrl = '/api/permissions';

  constructor(private http: HttpClient) {}

  findAll(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.baseUrl);
  }

  findById(id: number): Observable<Permission> {
    return this.http.get<Permission>(`${this.baseUrl}/${id}`);
  }

  create(permission: Permission): Observable<Permission> {
    return this.http.post<Permission>(this.baseUrl, permission);
  }

  update(id: number, permission: Permission): Observable<Permission> {
    return this.http.put<Permission>(`${this.baseUrl}/${id}`, permission);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
