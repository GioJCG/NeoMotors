import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from '@mui/material';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import api from '../../services/api';

const statCards = [
  { label: 'Órdenes activas', icon: BuildCircleIcon, color: '#1565c0', key: 'ordenesActivas' },
  { label: 'Facturas emitidas', icon: ReceiptLongIcon, color: '#2e7d32', key: 'facturas' },
  { label: 'Clientes registrados', icon: PeopleIcon, color: '#6a1b9a', key: 'clientes' },
  { label: 'Ingresos del mes', icon: AttachMoneyIcon, color: '#e65100', key: 'ingresosMes' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => setStats({ ordenesActivas: 0, facturas: 0, clientes: 0, ingresosMes: 0 }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={4}>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {statCards.map(({ label, icon: Icon, color, key }) => (
          <Grid key={key} item xs={12} sm={6} md={3}>
            <Card elevation={2}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Icon sx={{ fontSize: 48, color }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {key === 'ingresosMes'
                      ? `$${Number(stats[key] || 0).toLocaleString('es-MX')}`
                      : stats[key] ?? 0}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
