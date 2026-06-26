import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-session-modal',
  imports: [MatDialogModule, MatButtonModule, AsyncPipe],
  template: `
    <h2 mat-dialog-title>Sesión por vencer</h2>
    <mat-dialog-content>
      <p>
        Tu sesión expira en
        <strong>{{ auth.segundosRestantes$ | async }}</strong>
        segundos.
      </p>
      <p>¿Desea extender su sesión?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="cerrar(false)">No</button>
      <button mat-flat-button color="primary" type="button" (click)="cerrar(true)">
        Sí, extender
      </button>
    </mat-dialog-actions>
  `,
})
export class SessionModal {
  protected readonly auth = inject(Auth);
  private readonly dialogRef = inject(MatDialogRef<SessionModal>);

  protected cerrar(extender: boolean): void {
    this.dialogRef.close(extender);
  }
}