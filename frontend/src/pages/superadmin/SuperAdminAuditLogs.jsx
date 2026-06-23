import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, TextField, MenuItem, Button, CircularProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

const ENTIDADES = ['', 'Empresa', 'Usuario', 'FacturaFiscal', 'OrdenTrabajo', 'Cliente', 'Vehiculo', 'Cita', 'Pago', 'NotificacionTaller', 'CertificadoFiscal'];
const ACCIONES = ['', 'CREAR', 'ACTUALIZAR', 'ELIMINAR', 'TIMBRAR_CFDI', 'SUSPENDER_EMPRESA', 'ACTIVAR_EMPRESA', 'LOGIN', 'LOGOUT'];

export default function SuperAdminAuditLogs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 });
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ entidad: '', accion: '' });
  const { enqueueSnackbar } = useSnackbar();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: paginationModel.page + 1, limit: paginationModel.pageSize };
      if (filters.entidad) params.entidad = filters.entidad;
      if (filters.accion) params.accion = filters.accion;
      const { data } = await api.get('/superadmin/audit-logs', { params });
      setRows(data.data);
      setTotal(data.total);
    } catch {
      enqueueSnackbar('Error al cargar logs', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [paginationModel, filters, enqueueSnackbar]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const columns = [
    { field: 'accion', headerName: 'Acción', width: 170 },
    { field: 'entidad', headerName: 'Entidad', width: 130 },
    { field: 'entidadId', headerName: 'ID Entidad', width: 100,
      renderCell: (p) => p.value ? `${p.value.substring(0, 8)}...` : '-',
    },
    { field: 'usuarioId', headerName: 'Usuario', width: 100,
      renderCell: (p) => p.value ? `${p.value.substring(0, 8)}...` : '-',
    },
    { field: 'contexto', headerName: 'Contexto', width: 220 },
    {
      field: 'createdAt', headerName: 'Fecha', width: 170,
      valueFormatter: (v) => v ? new Date(v).toLocaleString('es-MX') : '-',
    },
    {
      field: 'payload', headerName: 'Payload', width: 250,
      renderCell: (p) => p.value ? (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 11, whiteSpace: 'pre-wrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {typeof p.value === 'string' ? p.value : JSON.stringify(p.value).substring(0, 80)}
        </Typography>
      ) : '-',
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Typography variant="h5" fontWeight={700}>Registros de Auditoría</Typography>
        <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
          <TextField select size="small" label="Entidad" value={filters.entidad} sx={{ minWidth: 140 }}
            onChange={(e) => setFilters((f) => ({ ...f, entidad: e.target.value }))}
          >
            {ENTIDADES.map((e) => <MenuItem key={e} value={e}>{e || 'Todas'}</MenuItem>)}
          </TextField>
          <TextField select size="small" label="Acción" value={filters.accion} sx={{ minWidth: 160 }}
            onChange={(e) => setFilters((f) => ({ ...f, accion: e.target.value }))}
          >
            {ACCIONES.map((a) => <MenuItem key={a} value={a}>{a || 'Todas'}</MenuItem>)}
          </TextField>
          <Button startIcon={<RefreshIcon />} onClick={fetchLogs} disabled={loading}>
            Actualizar
          </Button>
        </Box>
      </Box>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[20, 50, 100]}
        rowCount={total}
        paginationMode="server"
        disableRowSelectionOnClick
        autoHeight
        getRowId={(r) => r.id}
        sx={{ '& .MuiDataGrid-cell': { fontSize: 13 }, '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 } }}
      />
    </Box>
  );
}
