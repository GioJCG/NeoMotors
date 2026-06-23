export interface AuditLog {
  id: string;
  usuarioId?: string;
  accion: string;
  entidad: string;
  entidadId?: string;
  payload?: any;
  contexto?: string;
  ip?: string;
  createdAt: string;
}

export interface AuditLogResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
}
