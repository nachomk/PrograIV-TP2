import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '../../services/auth';
import { Publicaciones as PublicacionesService } from '../../services/publicaciones';
import { PublicacionCard } from '../publicacion-card/publicacion-card';
import { Publicacion } from '../../clases/publicacion';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { UsuarioService } from '../../services/usuario';
import { Usuario } from '../../clases/usuario';
import { EtiquetaPerfilPipe } from '../../shared/pipes/etiqueta-perfil.pipe';

@Component({
  selector: 'app-mi-perfil',
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    PublicacionCard,
    EtiquetaPerfilPipe
  ],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  private readonly auth = inject(Auth);
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly usuarioService = inject(UsuarioService);

  protected readonly sesion$ = this.auth.sesion$;

  protected publicaciones: Publicacion[] = [];
  protected cargandoPublicaciones = false;
  protected errorPublicaciones: string | null = null;
  protected readonly likesDados = new Set<string>();

  protected editando = false;
  protected guardando = false;
  protected mensajeError: string | null = null;
  protected mensajeExito: string | null = null;
  protected imagenSeleccionada: File | null = null;
  protected nombreArchivo = '';
  protected readonly perfilForm = new FormGroup({
    nombre: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
    apellido: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
    correo: new FormControl('', [Validators.required, Validators.email]),
    nombreUsuario: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20),
      Validators.pattern(/^[a-zA-Z0-9_]+$/),
    ]),
    fechaNacimiento: new FormControl<Date | null>(null, Validators.required),
    descripcion: new FormControl('', [Validators.required, Validators.maxLength(200)]),
    clave: new FormControl(''),
  });

  ngOnInit(): void {
    this.sesion$.subscribe((usuario) => {
      if (usuario?.id) {
        this.cargarUltimasPublicaciones(usuario.id);
      } else {
        this.publicaciones = [];
        this.cdr.detectChanges();
      }
    });
  }

  protected iniciarEdicion(usuario: Usuario): void {
    this.mensajeError = null;
    this.mensajeExito = null;
    this.imagenSeleccionada = null;
    this.nombreArchivo = '';
    this.editando = true;

    this.perfilForm.patchValue({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      nombreUsuario: usuario.nombreUsuario,
      fechaNacimiento: new Date(usuario.fechaNacimiento),
      descripcion: usuario.descripcion,
      clave: '',
    });
    this.cdr.detectChanges();
  }

  protected cancelarEdicion(): void {
    this.editando = false;
    this.mensajeError = null;
    this.perfilForm.reset();
    this.cdr.detectChanges();
  }

  protected onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imagenSeleccionada = input.files?.[0] ?? null;
    this.nombreArchivo = this.imagenSeleccionada?.name ?? '';
    this.cdr.detectChanges();
  }

  protected guardarPerfil(): void {
    this.mensajeError = null;
    this.mensajeExito = null;
    this.perfilForm.markAllAsTouched();
    if (this.perfilForm.invalid || this.guardando) return;

    const v = this.perfilForm.getRawValue();
    const formData = new FormData();

    formData.append('nombre', v.nombre!);
    formData.append('apellido', v.apellido!);
    formData.append('correo', v.correo!);
    formData.append('nombreUsuario', v.nombreUsuario!);
    formData.append('fechaNacimiento', v.fechaNacimiento!.toISOString());
    formData.append('descripcion', v.descripcion!);

    if (v.clave?.trim()) {
      if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(v.clave)) {
        this.mensajeError = 'La clave debe tener 8+ caracteres, una mayúscula y un número.';
        this.cdr.detectChanges();
        return;
      }
      formData.append('clave', v.clave);
    }

    if (this.imagenSeleccionada) {
      formData.append('imagenPerfil', this.imagenSeleccionada);
    }

    this.guardando = true;
    this.usuarioService.actualizarMiPerfil(formData).subscribe({
      next: (usuarioActualizado) => {
        this.guardando = false;
        this.editando = false;
        this.mensajeExito = 'Perfil actualizado correctamente.';
        this.auth.actualizarUsuarioEnSesion(usuarioActualizado);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardando = false;
        this.mensajeError = err.error?.message ?? 'No se pudo actualizar el perfil.';
        this.cdr.detectChanges();
      },
    });
  }

  private cargarUltimasPublicaciones(usuarioId: string): void {
    this.cargandoPublicaciones = true;
    this.errorPublicaciones = null;

    this.publicacionesService
      .listar({ usuarioId, orden: 'fecha', offset: 0, limit: 3 })
      .subscribe({
        next: (resp) => {
          this.publicaciones = resp.datos;
          this.likesDados.clear();
          for (const pub of resp.datos) {
            if (pub.yoDiLike) {
              this.likesDados.add(pub.id);
            }
          }
          this.cargandoPublicaciones = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.cargandoPublicaciones = false;
          this.errorPublicaciones = 'No se pudieron cargar tus publicaciones.';
          this.cdr.detectChanges();
        },
      });
  }

  protected onActualizada(actualizada: Publicacion): void {
    const i = this.publicaciones.findIndex((p) => p.id === actualizada.id);
    if (i !== -1) {
      this.publicaciones[i] = actualizada;
      this.cdr.detectChanges();
    }
  }

  protected onEliminada(id: string): void {
    this.publicaciones = this.publicaciones.filter((p) => p.id !== id);
    this.likesDados.delete(id);
    this.cdr.detectChanges();
  }

  protected onLikeChange(publicacionId: string, dioLike: boolean): void {
    if (dioLike) this.likesDados.add(publicacionId);
    else this.likesDados.delete(publicacionId);
  }

  protected get nombre() {
    return this.perfilForm.get('nombre');
  }
  protected get apellido() {
    return this.perfilForm.get('apellido');
  }
  protected get correo() {
    return this.perfilForm.get('correo');
  }
  protected get nombreUsuario() {
    return this.perfilForm.get('nombreUsuario');
  }
  protected get fechaNacimiento() {
    return this.perfilForm.get('fechaNacimiento');
  }
  protected get descripcion() {
    return this.perfilForm.get('descripcion');
  }
}