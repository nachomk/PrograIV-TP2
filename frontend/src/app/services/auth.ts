import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  tap,
  catchError,
  of,
} from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Usuario } from '../clases/usuario';
import { environment } from '../../environments/environment';
import { SessionModal } from '../components/session-modal.ts/session-modal';

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);
  private readonly apiUrl = environment.apiUrl;

  private readonly sesionSubject = new BehaviorSubject<Usuario | null>(null);
  readonly sesion$ = this.sesionSubject.asObservable();
  readonly segundosRestantes$ = new BehaviorSubject<number | null>(null);
  
  private expiraEn: Date | null = null;
  private intervaloSesion: ReturnType<typeof setInterval> | null = null;
  private alertaMostrada = false;
  private modalSesionRef: MatDialogRef<SessionModal> | null = null;


  login(identificador: string, clave: string): Observable<Usuario> {
    return this.http
      .post<Usuario>(`${this.apiUrl}/auth/login`, { identificador, clave })
      .pipe(tap((usuario) => this.establecerSesion(usuario)));
  }

  registrar(formData: FormData): Observable<Usuario> {
    return this.http
      .post<Usuario>(`${this.apiUrl}/auth/registro`, formData)
      .pipe(tap((usuario) => this.establecerSesion(usuario)));
  }

  autorizar(): Observable<Usuario> {
    return this.http
      .post<Usuario>(`${this.apiUrl}/auth/autorizar`, {})
      .pipe(tap((usuario) => this.establecerSesion(usuario)));
  }

  refrescar(): Observable<{ mensaje: string }> {
    return this.http
      .post<{ mensaje: string }>(`${this.apiUrl}/auth/refrescar`, {})
      .pipe(
        tap(() => {
          this.cerrarModalSesion();
          this.iniciarMonitoreoDesdeDuracion();
          this.alertaMostrada = false;
          this.segundosRestantes$.next(null);
        }),
      );
  }

  cerrarSesion(): void {
    this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe({
      complete: () => this.limpiarSesion(),
      error: () => this.limpiarSesion(),
    });
  }

  estaLogueado(): boolean {
    return this.sesionSubject.value !== null;
  }

  private restaurarSesion(): Observable<Usuario | null> {
    return this.autorizar().pipe(
      catchError(() => {
        this.limpiarSesion();
        return of(null);
      }),
    );
  }

  private establecerSesion(usuario: Usuario): void {
    this.sesionSubject.next(usuario);

    if (usuario.expiraEn) {
      this.iniciarMonitoreo(new Date(usuario.expiraEn));
    } else {
      this.iniciarMonitoreoDesdeDuracion();
    }
  }

  private limpiarSesion(): void {
    this.cerrarModalSesion();
    this.detenerMonitoreo();
    this.sesionSubject.next(null);
    this.alertaMostrada = false;
    this.segundosRestantes$.next(null);
  }

  private iniciarMonitoreoDesdeDuracion(): void {
    const expira = new Date(
      Date.now() + environment.jwtDuracionSegundos * 1000,
    );
    this.iniciarMonitoreo(expira);
  }

  private iniciarMonitoreo(expiraEn: Date): void {
    this.detenerMonitoreo();
    this.expiraEn = expiraEn;
    this.alertaMostrada = false;

    this.intervaloSesion = setInterval(() => {
      if (!this.expiraEn) return;
      const msRestantes = this.expiraEn.getTime() - Date.now();
      const segRestantes = Math.max(0, Math.ceil(msRestantes / 1000));
      this.segundosRestantes$.next(segRestantes);
      if (
        segRestantes <= environment.jwtAlertaSegundos &&
        segRestantes > 0 &&
        !this.alertaMostrada
      ) {
        this.alertaMostrada = true;
        this.abrirModalExtension();
      }
      if (segRestantes === 0) {
        this.cerrarModalSesion();
        this.limpiarSesion();
      }
    }, 1000);
  }

  private abrirModalExtension(): void {
    this.cerrarModalSesion();
    this.modalSesionRef = this.dialog.open(SessionModal, {
      disableClose: true,
    });
    this.modalSesionRef.afterClosed().subscribe((extender) => {
      this.modalSesionRef = null;
      if (extender) {
        this.refrescar().subscribe({
          error: () => this.limpiarSesion(),
        });
      }
    });
  }
  private cerrarModalSesion(): void {
    if (this.modalSesionRef) {
      this.modalSesionRef.close();
      this.modalSesionRef = null;
    }
  }

  private detenerMonitoreo(): void {
    if (this.intervaloSesion) {
      clearInterval(this.intervaloSesion);
      this.intervaloSesion = null;
    }
    this.expiraEn = null;
    this.segundosRestantes$.next(null);
  }

  limpiarSesionLocal(): void {
    this.limpiarSesion();
  }
}