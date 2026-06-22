# Project Charter - neoMotors

## Visión del Producto

Plataforma SaaS multiempresa, multisucursal y multiusuario para la gestión integral de talleres mecánicos, que optimiza la operación diaria, la facturación electrónica CFDI 4.0 y la toma de decisiones mediante indicadores clave de rendimiento.

## Objetivos del Proyecto

1. Implementar una arquitectura multiempresa aislada a nivel de datos con RBAC granular.
2. Proveer autenticación segura (local, OAuth, recuperación de contraseña) con JWT y Refresh Token.
3. Gestionar el ciclo de vida completo del taller: Clientes, Vehículos, Citas, Recepción, Diagnóstico, Cotización, Reparación y Entrega.
4. Controlar inventarios por sucursal con alertas de stock mínimo y descuento automático.
5. Integrar facturación electrónica CFDI 4.0 con timbrado vía PAC y generación de PDF.
6. Proporcionar panel de SuperUsuario para administración global de tenants.
7. Mantener trazabilidad inmutable mediante auditoría automática de todas las operaciones.

## Stakeholders

| Stakeholder | Perfil | Responsabilidad |
|---|---|---|
| SuperUsuario (Dueño de Plataforma) | Administrador global | Gestionar tenants, monitorear uso, auditar logs del sistema |
| AdministradorEmpresa | Dueño/Gerente de taller | Configurar empresa, sucursales, usuarios, facturación |
| SupervisorSucursal | Jefe de taller | Supervisar operación diaria, aprobar cotizaciones, gestionar personal |
| Operador / Técnico | Mecánico / Cajero | Capturar diagnósticos, registrar tiempos, procesar pagos |
| Consulta | Auditor / Reportería | Acceso de solo lectura a datos operativos y financieros |
| Cliente Final | Usuario externo | Recibir servicios, aprobar cotizaciones, recibir facturas |

## Matriz MoSCoW de Alcance MVP

### Must Have (Imprescindible)

- Registro y autenticación de usuarios (local + verificación email)
- Login con JWT y Refresh Token
- Recuperación de contraseña con rate-limiting
- Login federado OAuth (Google, Microsoft, GitHub)
- Modelo RBAC con 5 roles globales inyectados en migración
- CRUD de Empresas con campos fiscales CFDI 4.0
- CRUD de Sucursales con georreferenciación y sucursal Matriz
- Selector de contexto (Empresa/Sucursal activa) en sesión
- Branding dinámico por empresa (logo, colores, tema claro/oscuro)
- CRUD de Clientes con validación multiempresa (RFC/Email único por empresa)
- CRUD de Vehículos asociados a Cliente, con historial de órdenes
- Módulo de Citas con calendario y disponibilidad
- Flujo de Recepción de Vehículos con captura de fotos (cámara)
- Diagnóstico técnico con control de tiempos (Play/Pause)
- Motor de Cotizaciones con cálculos automáticos y flujo de aprobación
- CRUD de Proveedores y Compras de Refacciones
- CRUD de Refacciones con inventario por sucursal y alertas de stock mínimo
- Descuento automático de inventario al entregar orden
- Módulo de Caja (apertura, arqueo, cierre) con control de discrepancias
- Notificaciones internas de taller en tiempo real
- Motor de Auditoría inmutable
- Dashboard con KPIs: órdenes por estado, ingresos vs costos, stock crítico, eficiencia por técnico
- Carga segura de Certificados de Sello Digital (CSD) con cifrado AES-256
- Generación de XML CFDI 4.0, timbrado vía PAC y descarga PDF
- Consola de SuperUsuario para monitoreo y gestión de tenants
- Documentación Swagger de todos los endpoints

### Should Have (Importante pero no crítico)

- Captura asistida por GPS para ubicación de sucursales
- Escáner QR para acceso rápido a órdenes y refacciones
- Componente base homogéneo de listados y formularios reutilizables
- Catálogos SAT precargados mediante seeds
- Filtros combinados y búsqueda text-search en listados
- Paginación del lado del servidor
- Soft-delete generalizado
- Responsive Design completo

### Could Have (Valor añadido)

- Text-to-Speech (TTS) para lectura de órdenes en taller
- Registro de sacudidas por acelerómetro en entorno móvil
- Tema configurable por el usuario final

### Won't Have (Fuera de alcance MVP)

- Integración con sistemas POS físicos
- Módulo de nómina y recursos humanos
- Ecommerce o venta de refacciones en línea
- App móvil nativa (solo web responsive)
- Módulo de contabilidad electrónica
- Integración con plataformas de terceros (Shopify, MercadoLibre)

## Entregables del Proyecto

| Entrega | Módulos | Semana estimada |
|---|---|---|
| E1 | Project Charter y Matriz MoSCoW | 1 |
| E2 | Matriz de Riesgos e Issues | 1 |
| E3 | Núcleo SaaS, Autenticación, RBAC, Empresas, Sucursales, Layout | 2-3 |
| E4 | Framework CRUD, Catálogos SAT, Captura asistida | 2-3 |
| E5 | Core Business: Clientes, Vehículos, Órdenes, Citas, Inventario, Caja | 4-5 |
| E6 | Motor Fiscal CFDI y Consola Global SuperUsuario | 3-4 |

## Criterios de Éxito

- El sistema soporta múltiples empresas con datos completamente aislados.
- Todos los endpoints validan JWT, multiempresa y RBAC.
- Las operaciones de negocio generan registros de auditoría inmutables.
- El módulo fiscal genera XML CFDI 4.0 válido y timbra exitosamente vía PAC.
- La interfaz es responsiva y operable en escritorio, tablet y móvil.
- El código sigue principios SOLID, Clean Architecture y convenciones del stack definido.
