import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-mi-perfil',
  imports: [CommonModule, RouterLink, MatButtonModule],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil {
  private readonly auth = inject(Auth);
  protected readonly sesion$ = this.auth.sesion$;
}