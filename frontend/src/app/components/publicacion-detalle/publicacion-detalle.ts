import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Auth } from '../../services/auth';
import { Publicaciones as PublicacionesService } from '../../services/publicaciones';
import { Comentarios as ComentariosService } from '../../services/comentario';
import { Publicacion } from '../../clases/publicacion';
import { Comentario } from '../../clases/comentario';
import { AsyncPipe } from '@angular/common';
import { validarTextoNoVacio } from '../../config/validadores';

@Component({
  selector: 'app-publicacion-detalle',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    AsyncPipe
  ],
  templateUrl: './publicacion-detalle.html',
  styleUrl: './publicacion-detalle.css',
})
export class PublicacionDetalle implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(Auth);
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly comentariosService = inject(ComentariosService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly sesion$ = this.auth.sesion$;

  protected publicacion: Publicacion | null = null;
  protected comentarios: Comentario[] = [];
  protected totalComentarios = 0;
  protected offsetComentarios = 0;
  protected readonly limitComentarios = 5;

  protected cargandoPublicacion = false;
  protected cargandoComentarios = false;
  protected errorPublicacion: string | null = null;
  protected errorComentarios: string | null = null;

  protected creandoComentario = false;
  protected errorCreacion: string | null = null;

  protected comentarioEditandoId: string | null = null;
  protected guardandoEdicion = false;
  protected errorEdicion: string | null = null;

  protected readonly crearComentarioForm = new FormGroup({
    texto: new FormControl('', [Validators.required, validarTextoNoVacio(), Validators.maxLength(500)]),
  });

  protected readonly editarComentarioForm = new FormGroup({
    texto: new FormControl('', [Validators.required, validarTextoNoVacio(), Validators.maxLength(500)]),
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorPublicacion = 'Publicación no encontrada.';
      return;
    }
    this.cargarPublicacion(id);
    this.cargarComentarios(id);
  }

  protected get hayMasComentarios(): boolean {
    return this.comentarios.length < this.totalComentarios;
  }

  protected esAutorComentario(comentario: Comentario, usuarioId: string | undefined): boolean {
    return !!usuarioId && comentario.autorId === usuarioId;
  }

  protected etiquetaAutor(comentario: Comentario, usuarioId: string | undefined): string {
    if (this.esAutorComentario(comentario, usuarioId)) {
      return 'Vos';
    }
    return comentario.autorNombreUsuario
      ? `@${comentario.autorNombreUsuario}`
      : 'Usuario';
  }

  protected cargarPublicacion(id: string): void {
    this.cargandoPublicacion = true;
    this.errorPublicacion = null;

    this.publicacionesService.obtenerPorId(id).subscribe({
      next: (publicacion) => {
        this.publicacion = publicacion;
        this.cargandoPublicacion = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoPublicacion = false;
        this.errorPublicacion = 'No se pudo cargar la publicación.';
        this.cdr.detectChanges();
      },
    });
  }

  protected cargarComentarios(publicacionId: string, acumular = false): void {
    this.cargandoComentarios = true;
    this.errorComentarios = null;

    this.comentariosService
      .listar(publicacionId, this.offsetComentarios, this.limitComentarios)
      .subscribe({
        next: (resp) => {
          this.comentarios = acumular
            ? [...this.comentarios, ...resp.datos]
            : resp.datos;
          this.totalComentarios = resp.total;
          this.offsetComentarios = resp.offset + resp.datos.length;
          this.cargandoComentarios = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.cargandoComentarios = false;
          this.errorComentarios = 'No se pudieron cargar los comentarios.';
          this.cdr.detectChanges();
        },
      });
  }

  protected cargarMasComentarios(): void {
    if (!this.publicacion || this.cargandoComentarios || !this.hayMasComentarios) return;
    this.cargarComentarios(this.publicacion.id, true);
  }

  protected crearComentario(): void {
    if (!this.publicacion || this.creandoComentario) return;

    this.errorCreacion = null;
    this.crearComentarioForm.markAllAsTouched();
    if (this.crearComentarioForm.invalid) return;

    this.creandoComentario = true;
    const texto = this.crearComentarioForm.value.texto!;

    this.comentariosService.crear(this.publicacion.id, texto).subscribe({
      next: (nuevo) => {
        this.comentarios = [nuevo, ...this.comentarios];
        this.totalComentarios += 1;
        this.offsetComentarios += 1;
        this.crearComentarioForm.reset();
        this.creandoComentario = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.creandoComentario = false;
        this.errorCreacion = 'No se pudo crear el comentario.';
        this.cdr.detectChanges();
      },
    });
  }

  protected iniciarEdicion(comentario: Comentario): void {
    this.comentarioEditandoId = comentario.id;
    this.errorEdicion = null;
    this.editarComentarioForm.patchValue({ texto: comentario.texto });
    this.cdr.detectChanges();
  }

  protected cancelarEdicion(): void {
    this.comentarioEditandoId = null;
    this.errorEdicion = null;
    this.editarComentarioForm.reset();
    this.cdr.detectChanges();
  }

  protected guardarEdicion(comentarioId: string): void {
    if (this.guardandoEdicion) return;

    this.errorEdicion = null;
    this.editarComentarioForm.markAllAsTouched();
    if (this.editarComentarioForm.invalid) return;

    this.guardandoEdicion = true;
    const texto = this.editarComentarioForm.value.texto!;

    this.comentariosService.actualizar(comentarioId, texto).subscribe({
      next: (actualizado) => {
        const i = this.comentarios.findIndex((c) => c.id === comentarioId);
        if (i !== -1) {
          this.comentarios[i] = actualizado;
        }
        this.comentarioEditandoId = null;
        this.guardandoEdicion = false;
        this.editarComentarioForm.reset();
        this.cdr.detectChanges();
      },
      error: () => {
        this.guardandoEdicion = false;
        this.errorEdicion = 'No se pudo editar el comentario.';
        this.cdr.detectChanges();
      },
    });
  }

  protected formatearFecha(fecha: string | null): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}