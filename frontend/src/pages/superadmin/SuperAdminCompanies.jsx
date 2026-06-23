import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, IconButton, Tooltip, TextField, CircularProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

export default function SuperAdminCompanies() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: paginationModel.page + 1, limit: paginationModel.pageSize };
      if (search.trim()) params.search = search.trim();
      const { data } = await api.get('/superadmin/companies', { params });
      setRows(data.data);
      setTotal(data.total);
    } catch {
      enqueueSnackbar('Error al cargar empresas', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [paginationModel, search, enqueueSnackbar]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const handleToggleStatus = async (id, nombre) => {
    try {
      const { data } = await api.put(`/superadmin/companies/${id}/status`);
      enqueueSnackbar(`Empresa ${nombre} ${data.estado === 'ACTIVA' ? 'activada' : 'suspendida'}`, { variant: 'success' });
      fetchCompanies();
    } catch {
      enqueueSnackbar('Error al cambiar estado', { variant: 'error' });
    }
  };

  const columns = [
    { field: 'nombre', headerName: 'Nombre', width: 200 },
    { field: 'rfc', headerName: 'RFC', width: 140 },
    { field: 'razonSocial', headerName: 'Razón Social', width: 220 },
    {
      field: 'estado', headerName: 'Estado', width: 130,
      renderCell: (p) => (
        <Box sx={{
          px: 1.5, py: 0.5, borderRadius: 1, fontSize: 13, fontWeight: 600,
          bgcolor: p.value === 'ACTIVA' ? '#e8f5e9' : '#fbe9e7',
          color: p.value === 'ACTIVA' ? '#2e7d32' : '#c62828',
        }}>
          {p.value === 'ACTIVA' ? 'Activa' : p.value === 'SUSPENDIDA' ? 'Suspendida' : p.value}
        </Box>
      ),
    },
    {
      field: '_count', headerName: 'Sucursales', width: 120,
      valueGetter: (v) => v?.sucursales ?? 0,
    },
    {
      field: 'usuarios', headerName: 'Usuarios', width: 100,
      valueGetter: (_, row) => row._count?.usuariosAsignados ?? 0,
    },
    {
      field: 'facturas', headerName: 'Facturas', width: 100,
      valueGetter: (_, row) => row._count?.facturasFiscales ?? 0,
    },
    {
      field: 'createdAt', headerName: 'Creada', width: 120,
      valueFormatter: (v) => v ? new Date(v).toLocaleDateString('es-MX') : '-',
    },
    {
      field: 'actions', headerName: 'Acciones', width: 120, sortable: false,
      renderCell: (p) => (
        <Tooltip title={p.row.estado === 'ACTIVA' ? 'Suspender' : 'Activar'}>
          <IconButton
            size="small"
            color={p.row.estado === 'ACTIVA' ? 'error' : 'success'}
            onClick={() => handleToggleStatus(p.row.id, p.row.nombre)}
          >
            {p.row.estado === 'ACTIVA' ? <BlockIcon /> : <CheckCircleIcon />}
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>Empresas del Sistema</Typography>
        <Box display="flex" gap={1}>
          <TextField size="small" placeholder="Buscar por nombre, RFC..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCompanies()}
          />
          <Button startIcon={<RefreshIcon />} onClick={fetchCompanies} disabled={loading}>
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
        pageSizeOptions={[10, 20, 50]}
        rowCount={total}
        paginationMode="server"
        disableRowSelectionOnClick
        autoHeight
        getRowId={(r) => r.id}
        sx={{ '& .MuiDataGrid-cell': { fontSize: 14 }, '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 } }}
      />
    </Box>
  );
}
