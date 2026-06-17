import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '../../services/auth';
import { Publicaciones as PublicacionesService } from '../../services/publicaciones';
import { PublicacionCard } from '../publicacion-card/publicacion-card';
import { Publicacion } from '../../clases/publicacion';

@Component({
  selector: 'app-mi-perfil',
  imports: [CommonModule, RouterLink, MatButtonModule, PublicacionCard],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  private readonly auth = inject(Auth);
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly sesion$ = this.auth.sesion$;

  protected publicaciones: Publicacion[] = [];
  protected cargandoPublicaciones = false;
  protected errorPublicaciones: string | null = null;
  protected readonly likesDados = new Set<string>();

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

  private cargarUltimasPublicaciones(usuarioId: string): void {
    this.cargandoPublicaciones = true;
    this.errorPublicaciones = null;

    this.publicacionesService
      .listar({ usuarioId, orden: 'fecha', offset: 0, limit: 3 })
      .subscribe({
        next: (resp) => {
          this.publicaciones = resp.datos;
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
}