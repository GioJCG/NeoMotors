export interface Notificacion {
  id: string;
  empresaId: string;
  sucursalId?: string;
  usuarioId?: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  referencia?: string;
  leida: boolean;
  fechaLectura?: string;
  prioridad: string;
  createdAt: string;
}

export interface UnreadCount {
  count: number;
}

export interface NotificacionListResponse {
  data: Notificacion[];
  total: number;
  page: number;
  limit: number;
}
