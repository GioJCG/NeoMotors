export interface CsdStatus {
  cargado: boolean;
  vigente?: boolean;
  rfc?: string;
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  emisorRazonSocial?: string;
  serie?: string;
  numeroCertificado?: string;
}

export interface UploadCsdResponse {
  message: string;
  rfc: string;
  vigenciaDesde: string;
  vigenciaHasta: string;
  emisorRazonSocial?: string;
  serie?: string;
  numeroCertificado?: string;
}
