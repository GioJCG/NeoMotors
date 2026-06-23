import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import StoreIcon from '@mui/icons-material/Store';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import api from '../../services/api';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/superadmin/stats')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress />;
  if (!stats) return <Typography color="error">Error al cargar estadísticas</Typography>;

  const cards = [
    { icon: <BusinessIcon />, label: 'Total Empresas', value: stats.empresas.total, color: '#1976d2' },
    { icon: <CheckCircleIcon />, label: 'Activas', value: stats.empresas.activas, color: '#2e7d32' },
    { icon: <CancelIcon />, label: 'Suspendidas', value: stats.empresas.suspendidas, color: '#c62828' },
    { icon: <PeopleIcon />, label: 'Usuarios', value: stats.usuarios, color: '#6a1b9a' },
    { icon: <StoreIcon />, label: 'Sucursales', value: stats.sucursales, color: '#e65100' },
    { icon: <ReceiptIcon />, label: 'Facturas', value: stats.facturacion.total, color: '#00695c' },
    { icon: <CheckCircleIcon />, label: 'Timbradas', value: stats.facturacion.timbradas, color: '#2e7d32' },
    { icon: <CancelIcon />, label: 'Canceladas', value: stats.facturacion.canceladas, color: '#c62828' },
    { icon: <AttachMoneyIcon />, label: 'Monto Timbrado', value: `$${Number(stats.facturacion.montoTotalTimbrado).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, color: '#1565c0' },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Panel de Control Global
      </Typography>
      <Grid container spacing={2}>
        {cards.map((c, i) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Box sx={{ color: c.color }}>{c.icon}</Box>
                  <Typography variant="body2" color="text.secondary">{c.label}</Typography>
                </Box>
                <Typography variant="h5" fontWeight={700}>{c.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {stats.ordenes?.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" fontWeight={600} mb={2}>Órdenes de Trabajo por Estado</Typography>
          <Grid container spacing={2}>
            {stats.ordenes.map((o, i) => (
              <Grid item xs={6} sm={4} md={2} key={i}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">{o.estado}</Typography>
                    <Typography variant="h5" fontWeight={700}>{o.count}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
