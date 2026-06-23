import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import { CitasService } from '../../services/citas.service';
import { Cita } from '../../models/cita.model';
import { CitaDialogComponent } from './cita-dialog.component';

@Component({
  selector: 'app-citas-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FullCalendarModule,
  ],
  template: `
    <div class="citas-page">
      <div class="header">
        <h1>Agenda de Citas</h1>
        <button mat-flat-button color="primary" (click)="openToday()">
          <mat-icon>today</mat-icon>
          Hoy
        </button>
      </div>

      <div class="calendar-wrapper">
        <full-calendar
          [options]="calendarOptions"
        />
      </div>
    </div>
  `,
  styles: `
    .citas-page {
      max-width: 1200px;
      margin: 24px auto;
      padding: 0 16px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }

    .calendar-wrapper {
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `,
})
export class CitasPageComponent implements OnInit {
  private readonly citasService = inject(CitasService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly citas = signal<Cita[]>([]);

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridDay',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    selectable: true,
    editable: false,
    weekends: true,
    locale: 'es',
    allDaySlot: false,
    slotMinTime: '07:00:00',
    slotMaxTime: '20:00:00',
    slotDuration: '00:30:00',
    eventClick: (arg) => this.onEventClick(arg),
    select: (arg) => this.onDateSelect(arg),
    events: [],
    height: 'auto',
  };

  ngOnInit(): void {
    this.loadCitas();
  }

  private loadCitas(): void {
    this.citasService.findAll().subscribe({
      next: (res) => {
        this.citas.set(res.data);
        this.calendarOptions = {
          ...this.calendarOptions,
          events: res.data.map((c) => ({
            id: c.id,
            title: `${c.cliente?.nombre || '?'} - ${c.vehiculo?.placa || '?'}`,
            start: `${c.fecha.split('T')[0]}T${c.hora}:00`,
            backgroundColor: this.getEventColor(c.estado),
            borderColor: this.getEventColor(c.estado),
            extendedProps: { estado: c.estado },
          })),
        };
      },
      error: () => {
        this.snackBar.open('Error al cargar citas', 'Cerrar', { duration: 3000 });
      },
    });
  }

  private getEventColor(estado: string): string {
    switch (estado) {
      case 'PROGRAMADA': return '#2196f3';
      case 'CONFIRMADA': return '#4caf50';
      case 'CANCELADA': return '#f44336';
      case 'COMPLETADA': return '#9e9e9e';
      default: return '#2196f3';
    }
  }

  private onEventClick(arg: EventClickArg): void {
    const cita = this.citas().find((c) => c.id === arg.event.id);
    if (!cita) return;

    const dialogRef = this.dialog.open(CitaDialogComponent, {
      width: '500px',
      data: { cita, mode: 'view' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'edit') {
        this.openEditDialog(cita);
      } else if (result === 'delete') {
        this.confirmDelete(cita.id);
      }
    });
  }

  private onDateSelect(arg: DateSelectArg): void {
    const dateStr = arg.startStr.split('T')[0];
    const timeStr = arg.startStr.split('T')[1]?.substring(0, 5) || '08:00';

    const dialogRef = this.dialog.open(CitaDialogComponent, {
      width: '500px',
      data: { cita: null, mode: 'create', defaultFecha: dateStr, defaultHora: timeStr },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadCitas();
      }
    });
  }

  private openEditDialog(cita: Cita): void {
    const dialogRef = this.dialog.open(CitaDialogComponent, {
      width: '500px',
      data: { cita, mode: 'edit' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadCitas();
      }
    });
  }

  private confirmDelete(id: string): void {
    const confirmed = confirm('¿Cancelar esta cita?');
    if (!confirmed) return;

    this.citasService.remove(id).subscribe({
      next: () => {
        this.snackBar.open('Cita cancelada exitosamente', 'Cerrar', { duration: 3000 });
        this.loadCitas();
      },
      error: () => {
        this.snackBar.open('Error al cancelar cita', 'Cerrar', { duration: 3000 });
      },
    });
  }

  openToday(): void {
    this.calendarOptions = {
      ...this.calendarOptions,
      initialDate: new Date().toISOString().split('T')[0],
    };
  }
}
