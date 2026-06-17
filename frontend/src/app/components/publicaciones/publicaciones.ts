import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PublicacionCard } from '../publicacion-card/publicacion-card';
import { Publicaciones as PublicacionesService } from '../../services/publicaciones';
import { Auth } from '../../services/auth';
import {
  OrdenPublicaciones,
  Publicacion,
} from '../../clases/publicacion';

@Component({
  selector: 'app-publicaciones',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    PublicacionCard,
  ],
  templateUrl: './publicaciones.html',
  styleUrl: './publicaciones.css',
})
export class Publicaciones implements OnInit {
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly auth = inject(Auth);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly sesion$ = this.auth.sesion$;

  protected publicaciones: Publicacion[] = [];
  protected total = 0;
  protected offset = 0;
  protected readonly limit = 5;
  protected orden: OrdenPublicaciones = 'fecha';
  protected cargando = false;
  protected error: string | null = null;

  protected mostrarFormulario = false;
  protected creando = false;
  protected errorCreacion: string | null = null;
  protected imagenSeleccionada: File | null = null;
  protected nombreArchivo = '';

  protected readonly likesDados = new Set<string>();

  protected readonly crearForm = new FormGroup({
    titulo: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(100),
    ]),
    descripcion: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(1000),
    ]),
  });

  ngOnInit(): void {
    this.cargarPublicaciones();
  }

  protected get titulo() {
    return this.crearForm.get('titulo');
  }

  protected get descripcion() {
    return this.crearForm.get('descripcion');
  }

  protected get paginaActual(): number {
    return Math.floor(this.offset / this.limit) + 1;
  }

  protected get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.total / this.limit));
  }

  protected get hayAnterior(): boolean {
    return this.offset > 0;
  }

  protected get haySiguiente(): boolean {
    return this.offset + this.limit < this.total;
  }

  protected toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.cancelarCreacion();
    }
    this.cdr.detectChanges();
  }

  protected onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imagenSeleccionada = input.files?.[0] ?? null;
    this.nombreArchivo = this.imagenSeleccionada?.name ?? '';
    this.cdr.detectChanges();
  }

  protected cancelarCreacion(): void {
    this.crearForm.reset();
    this.imagenSeleccionada = null;
    this.nombreArchivo = '';
    this.errorCreacion = null;
    this.cdr.detectChanges();
  }

  protected crearPublicacion(usuarioId: string): void {
    this.errorCreacion = null;
    this.crearForm.markAllAsTouched();

    if (this.crearForm.invalid || this.creando) return;

    this.creando = true;
    const v = this.crearForm.getRawValue();

    const formData = new FormData();
    formData.append('titulo', v.titulo!);
    formData.append('descripcion', v.descripcion!);
    formData.append('usuarioId', usuarioId);

    if (this.imagenSeleccionada) {
      formData.append('imagenPublicacion', this.imagenSeleccionada);
    }

    this.publicacionesService.crear(formData).subscribe({
      next: (nueva) => {
        this.creando = false;
        this.mostrarFormulario = false;
        this.cancelarCreacion();
        this.orden = 'fecha';
        this.offset = 0;
        this.error = null;
    
        this.publicaciones = [
          nueva,
          ...this.publicaciones.filter((p) => p.id !== nueva.id),
        ].slice(0, this.limit);
        this.total += 1;
        this.cargando = false;
    
        this.cdr.detectChanges();
    
        this.cargarPublicaciones();
      },
      error: () => {
        this.creando = false;
        this.errorCreacion =
          'No se pudo crear la publicación. Revisá los datos e intentá de nuevo.';
        this.cdr.detectChanges();
      },
    });
  }

  protected cargarPublicaciones(): void {
    this.cargando = true;
    this.error = null;

    this.publicacionesService
      .listar({
        orden: this.orden,
        offset: this.offset,
        limit: this.limit,
      })
      .subscribe({
        next: (resp) => {
          this.publicaciones = resp.datos;
          this.total = resp.total;
          this.offset = resp.offset;
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.cargando = false;
          this.error = 'No se pudieron cargar las publicaciones.';
          this.cdr.detectChanges();
        },
      });
  }

  protected cambiarOrden(nuevoOrden: OrdenPublicaciones): void {
    if (this.orden === nuevoOrden) return;
    this.orden = nuevoOrden;
    this.offset = 0;
    this.cargarPublicaciones();
  }

  protected paginaAnterior(): void {
    if (!this.hayAnterior) return;
    this.offset -= this.limit;
    this.cargarPublicaciones();
  }

  protected paginaSiguiente(): void {
    if (!this.haySiguiente) return;
    this.offset += this.limit;
    this.cargarPublicaciones();
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
    this.total = Math.max(0, this.total - 1);
    this.likesDados.delete(id);

    if (this.publicaciones.length === 0 && this.hayAnterior) {
      this.offset -= this.limit;
      this.cargarPublicaciones();
    }
    this.cdr.detectChanges();
  }

  protected onLikeChange(publicacionId: string, dioLike: boolean): void {
    if (dioLike) {
      this.likesDados.add(publicacionId);
    } else {
      this.likesDados.delete(publicacionId);
    }
  }
}