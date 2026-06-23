import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  IconButton,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import { Formik, Form, FieldArray } from 'formik';
import { useSnackbar } from 'notistack';
import * as Yup from 'yup';
import api from '../../services/api';

const USO_CFDI_OPTIONS = [
  { value: 'G01', label: 'G01 - Adquisición de mercancías' },
  { value: 'G02', label: 'G02 - Devoluciones, descuentos o bonificaciones' },
  { value: 'G03', label: 'G03 - Gastos en general' },
  { value: 'I01', label: 'I01 - Construcciones' },
  { value: 'I02', label: 'I02 - Mobiliario y equipo de oficina' },
  { value: 'I03', label: 'I03 - Equipo de transporte' },
  { value: 'D01', label: 'D01 - Honorarios médicos, dentales y gastos hospitalarios' },
  { value: 'D02', label: 'D02 - Gastos médicos por incapacidad o discapacidad' },
  { value: 'D03', label: 'D03 - Gastos funerales' },
  { value: 'D04', label: 'D04 - Donativos' },
  { value: 'D05', label: 'D05 - Intereses reales efectivamente pagados por créditos hipotecarios' },
  { value: 'D06', label: 'D06 - Aportaciones voluntarias al SAR' },
  { value: 'D07', label: 'D07 - Primas por seguros de gastos médicos' },
  { value: 'D08', label: 'D08 - Gastos de transportación escolar obligatoria' },
  { value: 'D09', label: 'D09 - Depósitos en cuentas para el ahorro' },
  { value: 'D10', label: 'D10 - Pagos por servicios educativos' },
  { value: 'P01', label: 'P01 - Por definir' },
  { value: 'S01', label: 'S01 - Sin efectos fiscales' },
];

const FORMA_PAGO_OPTIONS = [
  { value: '01', label: '01 - Efectivo' },
  { value: '03', label: '03 - Transferencia electrónica' },
  { value: '04', label: '04 - Tarjeta de crédito' },
  { value: '28', label: '28 - Tarjeta de débito' },
  { value: '99', label: '99 - Otros' },
];

const METODO_PAGO_OPTIONS = [
  { value: 'PUE', label: 'PUE - Pago en una sola exhibición' },
  { value: 'PPD', label: 'PPD - Pago en parcialidades' },
];

const validationSchema = Yup.object().shape({
  ordenTrabajoId: Yup.string().required('La orden de trabajo es requerida'),
  usoCfdi: Yup.string(),
  formaPago: Yup.string(),
  metodoPago: Yup.string(),
  detalles: Yup.array().of(
    Yup.object().shape({
      cantidad: Yup.number().min(1, 'Mínimo 1').required('Requerido'),
      descripcion: Yup.string().required('Requerido'),
      precioUnitario: Yup.number().min(0, 'Debe ser mayor o igual a 0').required('Requerido'),
      descuento: Yup.number().min(0, 'Debe ser mayor o igual a 0'),
    }),
  ),
});

export default function BillingIssue() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSearchOrder = async () => {
    if (!searchTerm.trim()) return;
    setSearchLoading(true);
    try {
      const { data } = await api.get('/work-orders');
      const filtered = (data.data || data).filter(
        (o) =>
          o.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.id?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setSearchResults(filtered);
    } catch {
      enqueueSnackbar('Error al buscar órdenes de trabajo', { variant: 'error' });
    } finally {
      setSearchLoading(false);
    }
  };

  const selectOrder = (order, setFieldValue) => {
    setFieldValue('ordenTrabajoId', order.id);
    setSearchDialogOpen(false);
    setSearchTerm('');
    enqueueSnackbar(`Orden ${order.folio} seleccionada`, { variant: 'success' });
  };

  const initialValues = {
    ordenTrabajoId: '',
    usoCfdi: 'G03',
    formaPago: '01',
    metodoPago: 'PUE',
    detalles: [],
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        ordenTrabajoId: values.ordenTrabajoId,
        usoCfdi: values.usoCfdi,
        formaPago: values.formaPago,
        metodoPago: values.metodoPago,
      };
      if (values.detalles.length > 0) {
        payload.detalles = values.detalles.map((d) => ({
          cantidad: Number(d.cantidad),
          descripcion: d.descripcion,
          precioUnitario: Number(d.precioUnitario),
          descuento: Number(d.descuento || 0),
        }));
      }
      await api.post('/billing/issue', payload);
      enqueueSnackbar('Factura emitida exitosamente', { variant: 'success' });
      navigate('/billing');
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Error al emitir factura', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Emitir Factura CFDI 4.0
      </Typography>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
          <Form>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Datos de la factura
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Orden de Trabajo"
                    value={
                      values.ordenTrabajoId
                        ? `${values.ordenTrabajoId.substring(0, 8)}...`
                        : ''
                    }
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <IconButton onClick={() => setSearchDialogOpen(true)} size="small">
                          <SearchIcon />
                        </IconButton>
                      ),
                    }}
                    error={touched.ordenTrabajoId && !!errors.ordenTrabajoId}
                    helperText={touched.ordenTrabajoId && errors.ordenTrabajoId}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={touched.usoCfdi && !!errors.usoCfdi}>
                    <InputLabel>Uso CFDI</InputLabel>
                    <Select
                      name="usoCfdi"
                      value={values.usoCfdi}
                      label="Uso CFDI"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      {USO_CFDI_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.usoCfdi && errors.usoCfdi && (
                      <FormHelperText>{errors.usoCfdi}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={touched.formaPago && !!errors.formaPago}>
                    <InputLabel>Forma de pago</InputLabel>
                    <Select
                      name="formaPago"
                      value={values.formaPago}
                      label="Forma de pago"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      {FORMA_PAGO_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.formaPago && errors.formaPago && (
                      <FormHelperText>{errors.formaPago}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={touched.metodoPago && !!errors.metodoPago}>
                    <InputLabel>Método de pago</InputLabel>
                    <Select
                      name="metodoPago"
                      value={values.metodoPago}
                      label="Método de pago"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      {METODO_PAGO_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.metodoPago && errors.metodoPago && (
                      <FormHelperText>{errors.metodoPago}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Detalles (opcional)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Si no agrega detalles, se generará uno automático con el total de pagos
                </Typography>
              </Box>

              <FieldArray name="detalles">
                {({ push, remove }) => (
                  <>
                    {values.detalles.map((_, index) => (
                      <Box key={index} sx={{ p: 2, mb: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={3}>
                            <TextField
                              fullWidth
                              label="Cantidad"
                              name={`detalles.${index}.cantidad`}
                              type="number"
                              value={values.detalles[index].cantidad}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={
                                touched.detalles?.[index]?.cantidad &&
                                !!errors.detalles?.[index]?.cantidad
                              }
                              helperText={
                                touched.detalles?.[index]?.cantidad &&
                                errors.detalles?.[index]?.cantidad
                              }
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              fullWidth
                              label="Descripción"
                              name={`detalles.${index}.descripcion`}
                              value={values.detalles[index].descripcion}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={
                                touched.detalles?.[index]?.descripcion &&
                                !!errors.detalles?.[index]?.descripcion
                              }
                              helperText={
                                touched.detalles?.[index]?.descripcion &&
                                errors.detalles?.[index]?.descripcion
                              }
                            />
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <TextField
                              fullWidth
                              label="Precio unitario"
                              name={`detalles.${index}.precioUnitario`}
                              type="number"
                              value={values.detalles[index].precioUnitario}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={
                                touched.detalles?.[index]?.precioUnitario &&
                                !!errors.detalles?.[index]?.precioUnitario
                              }
                              helperText={
                                touched.detalles?.[index]?.precioUnitario &&
                                errors.detalles?.[index]?.precioUnitario
                              }
                            />
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <TextField
                              fullWidth
                              label="Descuento"
                              name={`detalles.${index}.descuento`}
                              type="number"
                              value={values.detalles[index].descuento}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={
                                touched.detalles?.[index]?.descuento &&
                                !!errors.detalles?.[index]?.descuento
                              }
                              helperText={
                                touched.detalles?.[index]?.descuento &&
                                errors.detalles?.[index]?.descuento
                              }
                            />
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <IconButton color="error" onClick={() => remove(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => push({ cantidad: 1, descripcion: '', precioUnitario: '', descuento: 0 })}
                    >
                      Agregar detalle
                    </Button>
                  </>
                )}
              </FieldArray>
            </Paper>

            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="outlined" onClick={() => navigate('/billing')}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                disabled={submitting}
              >
                {submitting ? 'Emitiendo...' : 'Emitir factura'}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>

      <Dialog open={searchDialogOpen} onClose={() => setSearchDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Buscar orden de trabajo</DialogTitle>
        <DialogContent>
          <Box display="flex" gap={1} mt={1}>
            <TextField
              fullWidth
              label="Folio o ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchOrder()}
            />
            <Button variant="contained" onClick={handleSearchOrder} disabled={searchLoading}>
              {searchLoading ? <CircularProgress size={20} /> : 'Buscar'}
            </Button>
          </Box>
          {searchResults.length > 0 && (
            <List sx={{ mt: 2 }}>
              {searchResults.map((order) => (
                <ListItem key={order.id} disablePadding>
                  <ListItemButton onClick={() => selectOrder(order, setFieldValue)}>
                    <ListItemText
                      primary={`Folio: ${order.folio}`}
                      secondary={`Cliente: ${order.cliente?.nombre || 'N/A'} | Estado: ${order.estado}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
          {searchResults.length === 0 && !searchLoading && searchTerm && (
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              No se encontraron órdenes
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
