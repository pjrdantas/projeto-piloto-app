import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';

import { AplicativosResponse } from '../../../models/aplicativos-response.model';
import { urlValidator } from '../../../validators/url-validator';

@Component({
  selector: 'app-aplicativos-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  templateUrl: './aplicativos-dialog.component.html',
  styleUrls: ['./aplicativos-dialog.component.scss']
})
export class AplicativosDialogComponent {

  form: FormGroup;
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AplicativosDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: AplicativosResponse
  ) {
    this.isEdit = !!this.data;

    // Cria formulário reativo
    this.form = this.fb.group({
      nome: [this.data?.nome || '', Validators.required],
      descricao: [this.data?.descricao || '', Validators.required],
      url: [this.data?.url || '', [Validators.required, urlValidator()]],
      moduleName: [this.data?.moduleName || '', Validators.required],
      exposedModule: [this.data?.exposedModule || '', Validators.required],
      routePath: [this.data?.routePath || '', Validators.required],
      ativo: [this.isEdit ? this.data?.ativo === 'S' : true] // No modo de criação, o padrão é 'ativo'
    });

  }

 save(): void {
  if (!this.form.valid) return;

  // Pega o valor bruto do formulário. O valor de 'ativo' será um booleano.
  const payload = this.form.getRawValue();

  if (this.isEdit && this.data?.id) payload.id = this.data.id; // Adiciona o ID se for edição

  this.dialogRef.close(payload);
}


  close(): void {
    this.dialogRef.close();
  }
}
