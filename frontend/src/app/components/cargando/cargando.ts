import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-cargando',
  imports: [MatProgressSpinnerModule],
  templateUrl: './cargando.html',
  styleUrl: './cargando.css',
})
export class Cargando implements OnInit {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.auth.autorizar().subscribe({
      next: () => {
        this.router.navigate(['/publicaciones']);
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }
}