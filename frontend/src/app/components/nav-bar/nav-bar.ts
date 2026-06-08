import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-nav-bar',
  imports: [CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
})
export class NavBar implements OnInit{
  private readonly auth = inject(Auth)
  private readonly cdr = inject (ChangeDetectorRef)

  protected readonly sesion$ = this.auth.sesion$
  
  ngOnInit(): void {
    this.sesion$.subscribe(() => this.cdr.detectChanges())
  }

  protected cerrarSesion(): void {
    this.auth.cerrarSesion()
  }
}
