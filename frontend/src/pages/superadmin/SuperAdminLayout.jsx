import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Tabs, Tab } from '@mui/material';

export default function SuperAdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabIndex = location.pathname === '/admin/companies' ? 1
    : location.pathname === '/admin/audit' ? 2
    : 0;

  return (
    <Box>
      <Tabs
        value={tabIndex}
        onChange={(_, v) => {
          if (v === 0) navigate('/admin');
          else if (v === 1) navigate('/admin/companies');
          else if (v === 2) navigate('/admin/audit');
        }}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Dashboard Global" />
        <Tab label="Empresas" />
        <Tab label="Auditoría" />
      </Tabs>
      <Outlet />
    </Box>
  );
}
