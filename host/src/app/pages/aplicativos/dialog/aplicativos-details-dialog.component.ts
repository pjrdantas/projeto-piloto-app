import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AplicativosResponse } from '../../../models/aplicativos-response.model';

@Component({
  selector: 'app-aplicativos-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  templateUrl: './aplicativos-details-dialog.component.html',
  styleUrls: ['./aplicativos-details-dialog.component.scss']
})
export class AplicativosDetailsDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<AplicativosDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AplicativosResponse
  ) { }

  close(): void {
    this.dialogRef.close();
  }

}
