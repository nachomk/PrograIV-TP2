import { ChangeDetectorRef, Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Publicaciones } from '../../services/publicaciones';
import { Publicacion } from '../../clases/publicacion';

@Component({
  selector: 'app-publicacion-card',
  imports: [MatButtonModule],
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.css',
})
export class PublicacionCard {
  private readonly publicacionesService = inject(Publicaciones)
  private readonly cdr = inject(ChangeDetectorRef)

  @Input({ required: true }) publicacion!: Publicacion
  @Input() usuarioId: string | null = null
  @Input() dioLike = false

  @Output() actualizada = new EventEmitter<Publicacion>()
  @Output() eliminada = new EventEmitter<string>()
  @Output() dioLikeChange = new EventEmitter<boolean>()

  protected cargandoLike = false
  protected cargandoEliminar = false

  protected get esAutor(): boolean {
    return !!this.usuarioId && this.usuarioId === this.publicacion.autorId;
  }

  protected toggleLike(): void {
    if(!this.usuarioId || this.cargandoLike) return;

    this.cargandoLike = true
    const peticion = this.dioLike
      ? this.publicacionesService.quitarMeGusta(this.publicacion.id)
      : this.publicacionesService.darMeGusta(this.publicacion.id);
    
    peticion.subscribe({
      next: (res) => {
        this.cargandoLike = false
        this.dioLike = !this.dioLike
        this.dioLikeChange.emit(this.dioLike)
        this.actualizada.emit(res)
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargandoLike = false;
        this.cdr.detectChanges();
      }
    })
  }

  protected eliminar(): void {
    if (!this.usuarioId || !this.esAutor || this.cargandoEliminar) return

    this.cargandoEliminar = true
    this.publicacionesService.eliminar(this.publicacion.id)
      .subscribe({
        next: () => {
          this.cargandoEliminar = false;
          this.eliminada.emit(this.publicacion.id)
          this.cdr.detectChanges();
        },
        error: () => {
          this.cargandoEliminar = false;
          this.cdr.detectChanges();
        }
      })
  }

  protected formatearFecha(fecha: string | null): string {
    if(!fecha) return ''
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }
}
