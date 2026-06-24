import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

export interface SessionModalData {
  segundosRestantes: number;
}

@Component({
  selector: 'app-session-modal',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Sesión por vencer</h2>
    <mat-dialog-content>
      <p>
        Quedan {{ data.segundosRestantes }} segundos de sesión.
        ¿Desea extender su sesión?
      </p>
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
  protected readonly data = inject<SessionModalData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<SessionModal>);

  protected cerrar(extender: boolean): void {
    this.dialogRef.close(extender);
  }
}