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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Auth } from '../../services/auth';
import {
  validarFortalezaClave,
  validarClavesIguales,
} from '../../config/validadores';

@Component({
  selector: 'app-registro',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  protected cargando = false;
  protected mensajeError: string | null = null;
  protected imagenSeleccionada: File | null = null;
  protected nombreArchivo = '';

  protected readonly registroForm = new FormGroup(
    {
      correo: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.maxLength(80),
      ]),
      nombre: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(30),
      ]),
      apellido: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(30),
      ]),
      nombreUsuario: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9_]+$/),
      ]),
      fechaNacimiento: new FormControl<Date | null>(null, Validators.required),
      descripcion: new FormControl('', [
        Validators.required,
        Validators.maxLength(200),
      ]),
      clave: new FormControl('', [Validators.required, validarFortalezaClave()]),
      repetirClave: new FormControl('', Validators.required),
    },
    { validators: validarClavesIguales('clave', 'repetirClave') }
  );

  protected get correo() { return this.registroForm.get('correo'); }
  protected get nombre() { return this.registroForm.get('nombre'); }
  protected get apellido() { return this.registroForm.get('apellido'); }
  protected get nombreUsuario() { return this.registroForm.get('nombreUsuario'); }
  protected get fechaNacimiento() { return this.registroForm.get('fechaNacimiento'); }
  protected get descripcion() { return this.registroForm.get('descripcion'); }
  protected get clave() { return this.registroForm.get('clave'); }
  protected get repetirClave() { return this.registroForm.get('repetirClave'); }

  protected onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.imagenSeleccionada = input.files?.[0] ?? null;
    this.nombreArchivo = this.imagenSeleccionada?.name ?? '';
  }

  protected enviar(): void {
    this.mensajeError = null;
    this.registroForm.markAllAsTouched();

    if (this.registroForm.invalid) return;

    this.cargando = true;
    const v = this.registroForm.getRawValue();

    const formData = new FormData();
    formData.append('correo', v.correo!);
    formData.append('nombre', v.nombre!);
    formData.append('apellido', v.apellido!);
    formData.append('nombreUsuario', v.nombreUsuario!);
    formData.append('fechaNacimiento', v.fechaNacimiento!.toISOString());
    formData.append('descripcion', v.descripcion!);
    formData.append('clave', v.clave!);

    if (this.imagenSeleccionada) {
      formData.append('imagenPerfil', this.imagenSeleccionada);
    }

    this.auth.registrar(formData).subscribe({
      next: () => {
        this.cargando = false;
        this.cdr.detectChanges();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.cargando = false;
        this.mensajeError =
          'No se pudo crear la cuenta. Revisá los datos e intentá de nuevo.';
        this.cdr.detectChanges();
      },
    });
  }
}