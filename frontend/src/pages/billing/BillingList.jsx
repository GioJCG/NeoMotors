import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useSnackbar } from 'notistack';
import api from '../../services/api';

const ESTADO_MAP = {
  GENERADA: 'Generada',
  TIMBRADA: 'Timbrada',
  CANCELADA: 'Cancelada',
};

export default function BillingList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
  const [total, setTotal] = useState(0);
  const { enqueueSnackbar } = useSnackbar();

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/billing', {
        params: { page: paginationModel.page + 1, limit: paginationModel.pageSize },
      });
      setRows(data.data);
      setTotal(data.total);
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Error al cargar facturas', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [paginationModel, enqueueSnackbar]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleDownloadXML = async (id) => {
    try {
      const res = await api.get(`/billing/${id}/download`, {
        params: { format: 'xml' },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const disposition = res.headers['content-disposition'];
      const filename = disposition
        ? disposition.split('filename=')[1]?.replace(/"/g, '')
        : `CFDI_${id}.xml`;
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      enqueueSnackbar('Error al descargar XML', { variant: 'error' });
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      const { data } = await api.get(`/billing/${id}/download`, {
        params: { format: 'pdf' },
      });
      const w = window.open();
      w.document.write(data.contenido);
      w.document.close();
    } catch (err) {
      enqueueSnackbar('Error al descargar PDF', { variant: 'error' });
    }
  };

  const columns = [
    {
      field: 'folio',
      headerName: 'Folio',
      width: 120,
    },
    {
      field: 'uuid',
      headerName: 'UUID',
      width: 250,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
            {params.value ? `${params.value.substring(0, 8)}...` : '-'}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'receptorRfc',
      headerName: 'Receptor (RFC)',
      width: 130,
    },
    {
      field: 'receptorNombre',
      headerName: 'Receptor',
      width: 200,
    },
    {
      field: 'fechaTimbrado',
      headerName: 'Fecha',
      width: 160,
      valueFormatter: (value) =>
        value ? new Date(value).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-',
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 130,
      align: 'right',
      valueFormatter: (value) => `$${Number(value || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 120,
      renderCell: (params) => (
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            fontSize: 13,
            fontWeight: 600,
            bgcolor:
              params.value === 'TIMBRADA' ? '#e8f5e9' :
              params.value === 'CANCELADA' ? '#fbe9e7' : '#fff3e0',
            color:
              params.value === 'TIMBRADA' ? '#2e7d32' :
              params.value === 'CANCELADA' ? '#c62828' : '#e65100',
          }}
        >
          {ESTADO_MAP[params.value] || params.value}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Descargar XML">
            <IconButton size="small" onClick={() => handleDownloadXML(params.row.id)}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ver PDF">
            <IconButton size="small" onClick={() => handleDownloadPDF(params.row.id)}>
              <PictureAsPdfIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>
          Facturas Emitidas
        </Typography>
        <Button startIcon={<RefreshIcon />} onClick={fetchInvoices} disabled={loading}>
          Actualizar
        </Button>
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
        getRowId={(row) => row.id}
        sx={{
          '& .MuiDataGrid-cell': { fontSize: 14 },
          '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 },
        }}
      />
    </Box>
  );
}
