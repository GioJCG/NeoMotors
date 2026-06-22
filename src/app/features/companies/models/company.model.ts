export interface Company {
  id: string;
  nombre: string;
  rfc: string;
  razonSocial: string;
  codigoPostalFiscal: string;
  regimenFiscal: string;
  logoUrl?: string | null;
  colorPrimario?: string | null;
  colorSecundario?: string | null;
  tema?: string | null;
  estado: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface CreateCompanyRequest {
  nombre: string;
  rfc: string;
  razonSocial: string;
  codigoPostalFiscal: string;
  regimenFiscal: string;
  logoUrl?: string;
  colorPrimario?: string;
  colorSecundario?: string;
  tema?: string;
}

export interface UpdateCompanyRequest {
  nombre?: string;
  rfc?: string;
  razonSocial?: string;
  codigoPostalFiscal?: string;
  regimenFiscal?: string;
  logoUrl?: string;
  colorPrimario?: string;
  colorSecundario?: string;
  tema?: string;
}
