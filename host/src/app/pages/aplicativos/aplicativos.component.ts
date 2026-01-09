import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';

import { AplicativosService } from '../../services/aplicativos.service';
import { AplicativosResponse } from '../../models/aplicativos-response.model';
import { AplicativosDialogComponent } from './dialog/aplicativos-dialog.component';
import { ConfirmationDialogComponent } from '../../shared/dialog-confirmacao/confirmation-dialog.component';
import { ConfirmationDialogData } from '../../models/confirmation-dialog.model';
import { MatDivider } from "@angular/material/divider";
import { AplicativosDetailsDialogComponent } from './dialog/aplicativos-details-dialog.component';

@Component({
  selector: 'app-aplicativos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSortModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatDivider
],
  templateUrl: './aplicativos.component.html',
  styleUrls: ['./aplicativos.component.scss']
})
export class AplicativosComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = [
    'id', 'nome', 'descricao', 'url',  'ativo', 'criadoEm', 'atualizadoEm', 'actions'
  ];


  dataSource = new MatTableDataSource<AplicativosResponse>([]);

  aplicativos$!: Observable<AplicativosResponse[]>;

  private refresh$ = new BehaviorSubject<void>(undefined);

  private subscription!: Subscription;

  constructor(
    private service: AplicativosService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.aplicativos$ = this.refresh$.pipe(

      switchMap(() => this.service.listAll()),
      map(data => data.map(d => ({ ...d, ativoBoolean: d.ativo === 'S' }))),

      tap(data => {
        this.dataSource.data = data;

        this.dataSource.paginator = this.paginator;
      })
    );

    this.subscription = this.aplicativos$.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.setDefaultSort();
  }

  private setDefaultSort() {
    setTimeout(() => {
      this.sort.active = 'id';
      this.sort.direction = 'asc';
      this.sort.sortChange.emit();
    });
  }

  loadAll(): void {
    this.refresh$.next();
  }

  openDialogCreate(): void {const dialogRef = this.dialog.open(AplicativosDialogComponent, {
      width: '600px',
      height: '430px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.create(result).subscribe({
          next: () => {
            this.loadAll();
            this.snackBar.open('Microfrontend criado com sucesso!', 'Fechar', { duration: 5000 });
          },
          error: err => this.snackBar.open('Erro ao criar microfrontend.', 'Fechar', { duration: 8000, panelClass: 'error-snackbar' })
        });
      }
    });
  }

openDialogEdit(m: AplicativosResponse): void {
  const dialogRef = this.dialog.open(AplicativosDialogComponent, {
    width: '600px',
    height: '430px',
    maxWidth: '90vw',
    data: m,
    disableClose: true
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result && m.id) {
      this.service.update(m.id, result).subscribe({
        next: () => {
          this.loadAll();
          this.snackBar.open('Microfrontend atualizado com sucesso!', 'Fechar', { duration: 5000 });
        },
        error: err => this.snackBar.open('Erro ao atualizar microfrontend.', 'Fechar', { duration: 8000, panelClass: 'error-snackbar' })
      });
    }
  });
}


  delete(id: number): void {
    const dialogData: ConfirmationDialogData = {
      message: 'Tem certeza que deseja excluir este microfrontend?',
      confirmButtonText: 'Excluir',
      confirmButtonColor: 'warn'
    };
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.service.delete(id).subscribe({
          next: () => {
            this.loadAll();
            this.snackBar.open('Microfrontend excluído com sucesso!', 'Fechar', { duration: 5000 });
          },
          error: err => this.snackBar.open('Erro ao excluir. Verifique permissões (somente ADMIN).', 'Fechar', { duration: 8000, panelClass: 'error-snackbar' })
        });
      }
    });
  }

openDialogDetails(m: AplicativosResponse): void {
  this.dialog.open(AplicativosDetailsDialogComponent, {
    width: '620px',
    height: '486px',
    maxWidth: '90vw',
    data: m,
    disableClose: true
  });
}





}
