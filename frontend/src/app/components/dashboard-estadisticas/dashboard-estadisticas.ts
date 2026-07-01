import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import Chart from 'chart.js/auto';
import { EstadisticasService } from '../../services/estadisticas';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard-estadisticas',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './dashboard-estadisticas.html',
  styleUrl: './dashboard-estadisticas.css',
})
export class DashboardEstadisticas implements AfterViewInit, OnDestroy {
  private readonly estadisticasService = inject(EstadisticasService);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('chartPublicaciones') chartPublicacionesRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartComentarios') chartComentariosRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartPorPublicacion') chartPorPublicacionRef!: ElementRef<HTMLCanvasElement>;

  protected cargando = false;
  protected mensajeError: string | null = null;

  protected readonly filtrosForm = new FormGroup({
    fechaDesde: new FormControl<Date | null>(this.haceUnMes(), Validators.required),
    fechaHasta: new FormControl<Date | null>(new Date(), Validators.required),
  });

  private chartPublicaciones: Chart | null = null;
  private chartComentarios: Chart | null = null;
  private chartPorPublicacion: Chart | null = null;
  private vistaLista = false;

  ngAfterViewInit(): void {
    this.vistaLista = true;
    this.cargarEstadisticas();
  }

  ngOnDestroy(): void {
    this.destruirGraficos();
  }

  protected cargarEstadisticas(): void {
    this.filtrosForm.markAllAsTouched();
    if (this.filtrosForm.invalid || this.cargando) return;

    const rango = this.obtenerRango();
    this.cargando = true;
    this.mensajeError = null;

    forkJoin({
      publicaciones: this.estadisticasService.publicacionesPorUsuario(rango),
      comentarios: this.estadisticasService.comentariosRealizados(rango),
      porPublicacion: this.estadisticasService.comentariosPorPublicacion(rango),
    }).subscribe({
      next: ({ publicaciones, comentarios, porPublicacion }) => {
        this.renderizarPublicaciones(publicaciones.datos);
        this.renderizarComentarios(comentarios.datos);
        this.renderizarPorPublicacion(porPublicacion.datos);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError = err.error?.message ?? 'No se pudieron cargar las estadísticas.';
        this.cdr.detectChanges();
      },
    });
  }

  private renderizarPublicaciones(datos: { nombreUsuario: string; cantidad: number }[]): void {
    if (!this.chartPublicacionesRef) return;
    this.chartPublicaciones?.destroy();

    this.chartPublicaciones = new Chart(this.chartPublicacionesRef.nativeElement, {
      type: 'bar',
      data: {
        labels: datos.map((d) => `@${d.nombreUsuario}`),
        datasets: [{
          label: 'Publicaciones',
          data: datos.map((d) => d.cantidad),
          backgroundColor: '#3A6B75',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    });
  }

  private renderizarComentarios(datos: { nombreUsuario: string; cantidad: number }[]): void {
    if (!this.chartComentariosRef) return;
    this.chartComentarios?.destroy();

    this.chartComentarios = new Chart(this.chartComentariosRef.nativeElement, {
      type: 'line',
      data: {
        labels: datos.map((d) => `@${d.nombreUsuario}`),
        datasets: [{
          label: 'Comentarios realizados',
          data: datos.map((d) => d.cantidad),
          borderColor: '#C17F59',
          backgroundColor: 'rgba(193, 127, 89, 0.2)',
          tension: 0.3,
          fill: true,
        }],
      },
      options: { responsive: true, maintainAspectRatio: false },
    });
  }

  private acortarTitulo(titulo: string, max = 28): string {
    return titulo.length > max ? `${titulo.slice(0, max - 3)}...` : titulo;
  }

  private renderizarPorPublicacion(datos: { titulo: string; cantidad: number }[]): void {
    if (!this.chartPorPublicacionRef) return;
    this.chartPorPublicacion?.destroy();
    const top = datos.slice(0, 6);
    this.chartPorPublicacion = new Chart(this.chartPorPublicacionRef.nativeElement, {
      type: 'pie',
      data: {
        labels: top.map((d) => this.acortarTitulo(d.titulo)),
        datasets: [{
          data: top.map((d) => d.cantidad),
          backgroundColor: ['#3A6B75', '#C17F59', '#8BAAB1', '#6B7280', '#D4A99A', '#2C3338'],
          borderWidth: 2,
          borderColor: '#F8F4EC',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 14,
              font: { size: 11 },
            },
          },
        },
      },
    });
  }
  

  private obtenerRango() {
    const v = this.filtrosForm.getRawValue();
    return {
      fechaDesde: this.aIsoFecha(v.fechaDesde!),
      fechaHasta: this.aIsoFecha(v.fechaHasta!),
    };
  }

  private aIsoFecha(fecha: Date): string {
    return fecha.toISOString().slice(0, 10);
  }

  private haceUnMes(): Date {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  }

  private destruirGraficos(): void {
    this.chartPublicaciones?.destroy();
    this.chartComentarios?.destroy();
    this.chartPorPublicacion?.destroy();
  }
}