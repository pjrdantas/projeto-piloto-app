import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(
    private snackBar: MatSnackBar,
    private logger: LoggerService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {

        // Não logar 401 para evitar poluir o console com erros de autenticação
        if (error.status !== 401) {
          // 🔎 Log técnico (dev / prod)
          this.logger.error('HTTP Error', {
            url: req.url,
            status: error.status,
            message: error.message,
            error
          });

          this.snackBar.open(
            'Erro inesperado ao processar a requisição',
            'Fechar',
            { duration: 3000 }
          );
        }

        return throwError(() => error);
      })
    );
  }
}
