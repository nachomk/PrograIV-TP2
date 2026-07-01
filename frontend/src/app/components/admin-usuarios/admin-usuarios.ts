import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { UsuarioService } from '../../services/usuario';
import { Auth } from '../../services/auth';
import { Usuario } from '../../clases/usuario';
import { validarFortalezaClave } from '../../config/validadores';
import { EtiquetaPerfilPipe } from '../../shared/pipes/etiqueta-perfil.pipe';
import { ConfirmarClickDirective } from '../../shared/directives/confirmar-click.directive';
import { ResaltarInactivoDirective } from '../../shared/directives/resaltar-inactivo.directive';

@Component({
  selector: 'app-admin-usuarios',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    EtiquetaPerfilPipe,
    ConfirmarClickDirective,
    ResaltarInactivoDirective
  ],
  templateUrl: './admin-usuarios.html',
  styleUrl: './admin-usuarios.css',
})
export class AdminUsuarios implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly auth = inject(Auth);
  private readonly cdr = inject(ChangeDetectorRef);

  protected usuarios: Usuario[] = [];
  protected usuarioActualId: string | null = null;
  protected cargando = false;
  protected creando = false;
  protected mensajeError: string | null = null;
  protected mensajeExito: string | null = null;

  protected readonly crearForm = new FormGroup({
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
    clave: new FormControl('', [Validators.required, validarFortalezaClave()]),
    perfil: new FormControl<'usuario' | 'administrador'>('usuario', Validators.required),
  });

  ngOnInit(): void {
    this.auth.sesion$.subscribe((u) => {
      this.usuarioActualId = u?.id ?? null;
      this.cdr.detectChanges();
    });
    this.cargarUsuarios();
  }

  protected cargarUsuarios(): void {
    this.cargando = true;
    this.mensajeError = null;

    this.usuarioService.listar().subscribe({
      next: (lista) => {
        this.usuarios = lista;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError = err.error?.message ?? 'No se pudieron cargar los usuarios.';
        this.cdr.detectChanges();
      },
    });
  }

  protected crearUsuario(): void {
    this.mensajeError = null;
    this.mensajeExito = null;
    this.crearForm.markAllAsTouched();
    if (this.crearForm.invalid || this.creando) return;

    const v = this.crearForm.getRawValue();
    this.creando = true;

    this.usuarioService.crear({
      nombre: v.nombre!,
      apellido: v.apellido!,
      correo: v.correo!,
      nombreUsuario: v.nombreUsuario!,
      fechaNacimiento: v.fechaNacimiento!.toISOString(),
      descripcion: v.descripcion!,
      clave: v.clave!,
      perfil: v.perfil!,
    }).subscribe({
      next: () => {
        this.creando = false;
        this.mensajeExito = 'Usuario creado correctamente.';
        this.crearForm.reset({ perfil: 'usuario' });
        this.cargarUsuarios();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.creando = false;
        this.mensajeError = err.error?.message ?? 'No se pudo crear el usuario.';
        this.cdr.detectChanges();
      },
    });
  }

  protected deshabilitar(usuario: Usuario): void {
    if (!usuario.id || !usuario.activa || usuario.id === this.usuarioActualId) return;
    this.mensajeError = null;

    this.usuarioService.deshabilitar(usuario.id).subscribe({
      next: () => this.cargarUsuarios(),
      error: (err) => {
        this.mensajeError = err.error?.message ?? 'No se pudo deshabilitar.';
        this.cdr.detectChanges();
      },
    });
  }

  protected rehabilitar(usuario: Usuario): void {
    if (!usuario.id || usuario.activa) return;
    this.mensajeError = null;

    this.usuarioService.rehabilitar(usuario.id).subscribe({
      next: () => this.cargarUsuarios(),
      error: (err) => {
        this.mensajeError = err.error?.message ?? 'No se pudo rehabilitar.';
        this.cdr.detectChanges();
      },
    });
  }

  protected get nombre() { return this.crearForm.get('nombre'); }
  protected get apellido() { return this.crearForm.get('apellido'); }
  protected get correo() { return this.crearForm.get('correo'); }
  protected get nombreUsuario() { return this.crearForm.get('nombreUsuario'); }
  protected get fechaNacimiento() { return this.crearForm.get('fechaNacimiento'); }
  protected get descripcion() { return this.crearForm.get('descripcion'); }
  protected get clave() { return this.crearForm.get('clave'); }
}