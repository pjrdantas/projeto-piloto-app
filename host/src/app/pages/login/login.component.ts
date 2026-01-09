import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../core/auth/auth.service';
import { AuthStateService } from '../../core/auth/auth-state.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  hide = true;
  loginForm: FormGroup;
  loading = false;
  private readonly MIN_LOADING_TIME = 500;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private authState: AuthStateService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      login: ['', [Validators.required, Validators.minLength(6)]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void { }

  fazerLogin(): void {
    if (this.loginForm.invalid || this.loading) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const inicio = Date.now();
    this.loading = true;
    this.cdr.detectChanges();

    this.authService.login(this.loginForm.value)
      .pipe(
        finalize(() => {
          const decorrido = Date.now() - inicio;
          const restante = this.MIN_LOADING_TIME - decorrido;
          setTimeout(() => {
            this.loading = false;
            this.cdr.detectChanges();
          }, Math.max(0, restante));
        })
      )
      .subscribe({
  next: (res) => {

    this.authState.setAuth(
      res.token,
      res.refreshToken,
      {
        usuario: res.usuario,
        nome: res.nome,
        perfis: res.perfis
      }
    );


    this.router.navigate(['/app']);
  },
  error: (err) => {
    if (err && err.status === 401) {
      this.snackBar.open('Usuário ou senha inválidos', 'Fechar', { duration: 5000 });
    } else {
      this.snackBar.open('Erro ao autenticar. Tente novamente.', 'Fechar', { duration: 8000, panelClass: 'error-snackbar' });
    }
  }
});

  }
}
