import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Tabs, Tab } from '@mui/material';

export default function BillingLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabValue = location.pathname === '/billing/issue' ? 1 : 0;

  return (
    <Box>
      <Tabs
        value={tabValue}
        onChange={(_, v) => navigate(v === 0 ? '/billing' : '/billing/issue')}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Facturas emitidas" />
        <Tab label="Emitir factura" />
      </Tabs>
      <Outlet />
    </Box>
  );
}
