import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '../../services/auth';
import { validarFortalezaClave } from '../../config/validadores';
import { AutoFocusDirective } from '../../shared/directives/auto-focus.directive';

@Component({
  selector: 'app-login',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    AutoFocusDirective
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  protected cargando = false;
  protected mensajeError: string | null = null;

  protected readonly loginForm = new FormGroup({
    identificador: new FormControl('', [Validators.required]),
    clave: new FormControl('', [Validators.required, validarFortalezaClave()]),
  });

  protected get identificador() {
    return this.loginForm.get('identificador');
  }

  protected get clave() {
    return this.loginForm.get('clave');
  }

  protected enviar(): void {
    this.mensajeError = null;
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) return;

    this.cargando = true;
    const identificador = this.loginForm.value.identificador!;
    const clave = this.loginForm.value.clave!;

    this.auth.login(identificador, clave).subscribe({
      next: () => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError =
          err.error?.message ??
          'Correo/usuario o contraseña incorrectos.';
        this.cdr.detectChanges();
      },
    });
  }
}