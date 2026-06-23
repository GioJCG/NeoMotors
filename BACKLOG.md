# neoMotors - Backlog Maestro Ajustado a Rúbrica Avanzada

**Proyecto final SaaS multiempresa, multisucursal y multiusuario con soporte fiscal SAT y CFDI** **Caso de negocio:** neoMotors - gestión integral de talleres mecánicos y optimización operativa  
**Objetivo:** cumplir la rúbrica académica y dejar instrucciones suficientemente claras para ejecución técnica en Antigravity.

---

## 1. Alcance del Proyecto

El sistema implementa una plataforma SaaS con las siguientes capacidades obligatorias:
- Arquitectura Multiempresa aislada a nivel de datos.
- Estructura Multisucursal para operaciones descentralizadas.
- Gestión Multiusuario basada en Roles y Permisos (RBAC).
- Panel de SuperUsuario (Consola Global).
- Flujo seguro de Autenticación (Registro, verificación, recuperación y OAuth).
- Branding dinámico por empresa (Logos, colores, temas).
- Framework de CRUDs reutilizables y homogéneos.
- Captura asistida mediante hardware del dispositivo (GPS, Cámara, QR, TTS, Acelerómetro).
- Catálogos oficiales del SAT integrados de solo lectura.
- Facturación electrónica CFDI (Generación de XML, Timbrado vía PAC y PDF).
- **Core de Negocio:** Control total de taller mecánico, inventarios, citas, productividad y facturación.

---

## 2. Definiciones Globales y Reglas Técnicas

### 2.1 Roles Globales (RBAC)
- **SuperUsuario:** Acceso total y global a todas las empresas, logs del sistema y catálogos maestros.
- **AdministradorEmpresa:** Gestión total de los recursos, sucursales, facturación y usuarios de su empresa asignada.
- **SupervisorSucursal:** Administra y supervisa la operación diaria de una o más sucursales asignadas.
- **Operador (Técnico/Cajero):** Captura información y opera exclusivamente los módulos asignados a su sucursal activa.
- **Consulta:** Acceso de solo lectura para auditorías o reportería básica.

### 2.2 Reglas de Oro del Negocio
- **Multi-tenancy:** Ningún usuario puede interactuar con datos de una empresa distinta a la de su sesión activa.
- **Herencia Operativa:** Todo registro de negocio debe colgar de una `Empresa` y, de aplicar, de una `Sucursal`.
- **Trazabilidad Inmutable:** Cualquier cambio en entidades críticas debe registrar de forma automática: `UsuarioID`, `Timestamp`, `Contexto` (Empresa/Sucursal) y `Payload` de cambios en la tabla de auditoría.
- **Bloqueo Fiscal:** No se permitirá el timbrado si los certificados (.cer/.key) de la empresa están vencidos o si el RFC receptor no cumple las validaciones de estructura del SAT.

---

## 3. Entregas del Proyecto (Roadmap de Ejecución)

| Entrega | Objetivo Principal | Módulos Clave |
|---|---|---|
| **Entrega 1** | Project Charter & MoSCoW | Definición de objetivos, stakeholders y matriz de alcance. |
| **Entrega 2** | Gestión de Riesgos e Issues | Matriz de issues, supuestos técnicos y plan de contingencia. |
| **Entrega 3** | Núcleo SaaS & Autenticación | Auth local, OAuth, RBAC, CRUD de Empresas/Sucursales y Layout Dinámico. |
| **Entrega 4** | Framework CRUD & Datos SAT | Componentes base UI, base de datos SAT, captura por QR/Cámara/GPS/TTS. |
| **Entrega 5** | Core Business (neoMotors) | Clientes, Vehículos, Órdenes, Citas, Inventarios, Caja y Productividad. |
| **Entrega 6** | Motor Fiscal & Consola Global | Carga de CSD, Generación XML, Timbrado PAC, PDF y Consola de SuperUsuario. |

---

# PLAN DETALLADO DE HISTORIAS DE USUARIO (BACKLOG)

## ENTREGA 1 & 2: REQUERIMIENTOS INICIALES Y RIESGOS

### EPIC E1: Definición del Producto e Issues
#### TASK E1.1.1: Project Charter y Matriz MoSCoW
- **Objetivo:** Formalizar el alcance del MVP para la rúbrica y delimitar exclusiones.
- **Entradas:** Rúbrica académica, modelo de negocio neoMotors.
- **Salidas:** Documento Project Charter digital.
- **Criterios de Aceptación:**
  - Define explícitamente el alcance Must, Should, Could y Won't.
  - Documenta los perfiles de los stakeholders iniciales.

#### TASK E1.1.2: Matriz de Issues y Riesgos Técnicos
- **Objetivo:** Mapear los principales riesgos del desarrollo y su respectiva mitigación.
- **Salidas:** Matriz de Riesgos en formato estructurado.
- **Criterios de Aceptación:**
  - Incluye obligatoriamente mitigaciones para: Latencia en comunicación con PAC, almacenamiento seguro de llaves privadas (.key), consistencia en transiciones de la máquina de estados de la orden de trabajo, y rendimiento de búsquedas en catálogos masivos (Códigos postales y Productos/Servicios SAT).

---

## ENTREGA 3: CONFIGURACIÓN BASE, SEGURIDAD Y MULTI-TENANCY

### EPIC 1: Autenticación, Acceso y Seguridad (RBAC)
#### TASK 1.1.1: Registro de Usuario Local y Verificación
- **Objetivo:** Permitir la creación de cuentas de usuario de manera segura.
- **Tablas Afectadas:** `Usuario`, `VerificacionCuenta`
- **Endpoints:** `POST /api/v1/auth/register`, `POST /api/v1/auth/verify`
- **Validaciones:** Email con estructura correcta y único; contraseña con hash robusto (ej. bcrypt/argon2).
- **Criterios de Aceptación:**
  - El usuario recién creado se guarda en estado `PENDIENTE`.
  - Envía un token único con expiración de 24 horas; al validarse cambia a estado `ACTIVO`.

#### TASK 1.1.2: Autenticación Local y Recuperación
- **Endpoints:** `POST /api/v1/auth/login`, `POST /api/v1/auth/forgot-password`, `POST /api/v1/auth/reset`
- **Criterios de Aceptación:**
  - El Login exitoso retorna un JWT (Access Token) y un Refresh Token de larga duración.
  - El flujo de recuperación invalida el token temporal inmediatamente después de su primer uso de cambio de contraseña.
  - Implementa rate-limiting por IP y por cuenta para mitigar ataques de fuerza bruta.

#### TASK 1.1.3: Login Federado (OAuth 2.0 Multi-proveedor)
- **Endpoints:** `GET /api/v1/auth/{provider}`, `GET /api/v1/auth/{provider}/callback` (Providers: `google`, `microsoft`, `github`).
- **Criterios de Aceptación:**
  - Si el email devuelto por el proveedor ya existe en el sistema, vincula la cuenta registrando el provider correspondiente.
  - Si no existe, genera un perfil base en estado `ACTIVO` asociado al proveedor correspondiente.

#### TASK 1.1.4: Configuración del Modelo de Roles y Permisos (RBAC)
- **Tablas Afectadas:** `Rol`, `Permiso`, `RolPermiso`, `UsuarioRol`
- **Criterios de Aceptación:**
  - Inyección inicial obligatoria de los 5 roles globales en script de migración.
  - Middleware de backend intercepta y valida permisos granulares en cada endpoint.
  - La interfaz de usuario oculta o deshabilita botones/vistas si las credenciales decodificadas del JWT carecen del permiso requerido.

### EPIC 2: Estructura Organizacional SaaS (Multi-Tenancy)
#### TASK 2.1.1: CRUD de Empresas y Configuración Fiscal Base
- **Tablas Afectadas:** `Empresa`
- **Endpoints:** `GET/POST/PUT/DELETE /api/v1/companies`
- **Criterios de Aceptación:**
  - El SuperUsuario puede realizar acciones globales. El Administrador de Empresa solo puede editar (`PUT`) los datos de su propia entidad.
  - Almacena campos fiscales estrictos obligatorios para CFDI 4.0: Razón Social, RFC, Código Postal Fiscal y Régimen Fiscal.

#### TASK 2.1.2: CRUD de Sucursales con Georreferenciación
- **Tablas Afectadas:** `Sucursal`
- **Endpoints:** `GET/POST/PUT/DELETE /api/v1/branches`
- **Criterios de Aceptación:**
  - Cada sucursal pertenece de forma estricta a una `Empresa`.
  - Permite marcar una única sucursal por empresa como "Matriz/Principal".

#### TASK 2.1.3: Gestión de Relaciones y Selector de Contexto en Sesión
- **Tablas Afectadas:** `UsuarioEmpresa`, `UsuarioSucursal`
- **Criterios de Aceptación:**
  - Interfaz de usuario (Header) incluye un componente desplegable de selección de contexto (Empresa activa / Sucursal activa).
  - Al cambiar de contexto en el selector, el sistema invalida/refresca los menús dinámicos y filtra de forma automática todas las peticiones posteriores de datos en el backend.

### EPIC 3: Configuración Visual y Layout Base
#### TASK 3.1.1: Branding Dinámico por Empresa
- **Criterios de Aceptación:**
  - La tabla `Empresa` almacena URL del logo, Color Primario (Hex), Color Secundario (Hex) y preferencia de tema (claro/oscuro).
  - Al iniciar sesión, la UI lee las propiedades de branding de la empresa activa y aplica los estilos CSS dinámicamente mediante variables nativas garantizando ratios de contraste accesibles.

---

## ENTREGA 4: FRAMEWORK DE CRUDS Y CATÁLOGOS FISCALES

### EPIC 4: Arquitectura de Componentes Reutilizables y Datos SAT
#### TASK 4.1.1: Componente Base de Listados y Formularios Homogéneos
- **Criterios de Aceptación:**
  - Todos los CRUDs implementan la misma plantilla visual: Tabla responsive, paginación del lado del servidor, filtros combinados y campo de búsqueda general text-search.
  - Formularios base con validación reactiva en línea (inline), control unificado de errores HTTP y soporte para soft-delete generalizado.

#### TASK 4.1.2: Estructura e Ingesta de Catálogos Oficiales SAT
- **Tablas Afectadas:** `SatPais`, `SatEstado`, `SatMunicipio`, `SatCodigoPostal`, `SatColonia`, `SatProductoServicio`, `SatUnidadMedida`, `SatRegimenFiscal`, `SatUsoCfdi`.
- **Criterios de Aceptación:**
  - Scripts de migración o seeds de base de datos automatizan la carga completa de datos oficiales del SAT.
  - Tablas optimizadas mediante índices de búsqueda compuestos. Son de estricta solo lectura para usuarios operativos.

#### TASK 4.1.3: Módulo de Captura Asistida mediante APIs y Hardware
- **Criterios de Aceptación:**
  - **GPS e Integración de Mapas:** Componente visual para registrar la ubicación exacta de las sucursales u órdenes guardando coordenadas de Latitud y Longitud.
  - **Cámara y Carga de Archivos:** Componente para capturar o adjuntar fotografías de evidencias directamente desde el navegador o dispositivo móvil con compresión de peso en cliente antes de la subida.
  - **Escáner QR:** Habilidad de usar la cámara para escanear un código QR impreso o digital, redirigiendo de inmediato al usuario al detalle de la Orden de Trabajo o Refacción asociada.
  - **Text-to-Speech (TTS):** Botón de accesibilidad en pantallas de taller que lee en voz alta el estado actual y las instrucciones clave de la orden de trabajo seleccionada.
  - **Acelerómetro:** Registro en bitácora local del navegador de sacudidas severas del dispositivo (en entorno móvil) como evento simple de control de uso.

---

## ENTREGA 5: CORE BUSINESS - OPERACIÓN DE NEOMOTORS

### EPIC 5: Gestión de Clientes y Directorio
#### TASK 5.1.1: CRUD de Clientes con Validación Multitenant
- **Tablas Afectadas:** `Cliente`
- **Endpoints:** `GET/POST/PUT/DELETE /api/v1/customers`
- **Criterios de Aceptación:**
  - Los registros pertenecen de forma aislada a la empresa en sesión.
  - El sistema bloquea duplicados basándose en la combinación de `EmpresaID` + `RFC` o `EmpresaID` + `Email`.

### EPIC 6: Control de Vehículos y Flotas
#### TASK 6.1.1: CRUD de Vehículos e Historial de Mantenimiento
- [x] **Tablas Afectadas:** `Marca`, `Modelo`, `Vehiculo`
- [x] **Endpoints:** `GET/POST/PUT/DELETE /api/v1/vehicles`
- [x] **Criterios de Aceptación:**
  - [x] Todo vehículo requiere asociarse a un `Cliente` dueño. La combinación de `EmpresaID` + `Placa` debe ser única.
  - [x] Endpoint historial de mantenimiento (placeholder para Órdenes de Trabajo futuras)
- **Branch:** Backend `026169f` | Frontend `140f3c5`

### EPIC 7: Agenda de Citas y Recepción Digital
#### TASK 7.1.1: Módulo de Citas y Recordatorios
- [x] **Tablas Afectadas:** `Cita`
- [x] **Endpoints:** `GET/POST/PUT/DELETE /api/v1/appointments`
- [x] **Criterios de Aceptación:**
  - [x] Calendario interactivo (FullCalendar) con vistas día/semana/mes
  - [x] Crear cita seleccionando fecha/hora en el calendario
  - [x] Asociación obligatoria a Cliente + Vehículo
  - [x] Evento asíncrono `cita.creada` para envío de confirmación por email
  - [x] Endpoint `GET /appointments/availability` para consultar disponibilidad
- **Branch:** Backend `cc17db7` | Frontend `4a3189c`

#### TASK 7.1.2: Flujo de Recepción de Vehículos e Inventario de Entrada
- **Tablas Afectadas:** `RecepcionVehiculo`, `OrdenTrabajo`
- **Endpoints:** `POST /api/v1/work-orders/reception`
- **Criterios de Aceptación:**
  - Captura obligatoria de: Kilometraje actual, nivel de combustible, componentes faltantes y marcas de daños físicos en la carrocería.
  - El operador puede usar el componente de **Cámara** para capturar hasta 4 fotografías de evidencia del estado inicial del automóvil. Genera automáticamente una `OrdenTrabajo` en estado inicial `RECIBIDO`.

### EPIC 8: Diagnóstico Técnico y Tiempos Operativos
#### TASK 8.1.1: Captura de Diagnósticos por Técnico y Control de Eficiencia
- **Tablas Afectadas:** `Diagnostico`, `TiempoTecnico`
- **Endpoints:** `POST /api/v1/work-orders/{id}/diagnose`, `POST /api/v1/work-orders/{id}/track-time`
- **Criterios de Aceptación:**
  - La captura de síntomas, fallas encontradas y desgastes de piezas solo está permitida si la orden de trabajo está en estado `DIAGNÓSTICO`.
  - Mecanismo de "Play/Pause" (Control de tiempos) que registra las horas exactas que un técnico invierte activamente trabajando en una orden específica, computando la productividad final contra el tiempo estimado configurado.

### EPIC 9: Cotizaciones y Presupuestos
#### TASK 9.1.1: Motor de Cotizaciones y Flujo de Aprobación
- **Tablas Afectadas:** `Cotizacion`, `CotizacionDetalle`
- **Endpoints:** `GET/POST/PUT/DELETE /api/v1/quotes`
- **Criterios de Aceptación:**
  - Permite agregar de forma dinámica filas desglosadas por concepto de Servicios, Mano de Obra y Refacciones.
  - Realiza cálculos automáticos precisos de Subtotal, Descuentos, IVA (parámetro configurable) y Total Final.
  - La máquina de estados de la Orden de Trabajo se bloquea y no avanza al estado `EN_REPARACION` hasta que la cotización asociada cambie formalmente a estado `APROBADA` (por un rol administrativo o verificación del cliente).

### EPIC 10: Control de Inventario y Catálogo de Proveedores
#### TASK 10.1.1: CRUD de Proveedores y Compras de Refacciones
- **Tablas Afectadas:** `Proveedor`, `OrdenCompra`
- **Criterios de Aceptación:**
  - Registra proveedores de refacciones ligándolos a la empresa. Permite la entrada de material al inventario mediante el registro de compras documentando costos de adquisición.

#### TASK 10.1.2: CRUD de Refacciones y Descuento Automatizado de Stock
- **Tablas Afectadas:** `Refaccion`, `Inventario`, `MovimientoInventario`
- **Criterios de Aceptación:**
  - El inventario está estrictamente segmentado por `SucursalID`. Almacena alertas de Stock Mínimo.
  - Al cambiar una orden de trabajo al estado `ENTREGADO`, el sistema ejecuta una transacción de base de datos que descuenta automáticamente las unidades consumidas del inventario y genera un registro en `MovimientoInventario` con tipo `SALIDA_POR_ORDEN`.
  - Si una refacción requerida no tiene stock disponible en la sucursal actual, el sistema impide la transición a entrega, a menos que un Supervisor autorice explícitamente un ajuste.

### EPIC 11: Finanzas, Control de Caja y Comunicación Interna
#### TASK 11.1.1: Módulo de Aperturas, Arqueos y Cierre de Caja Chica
- **Tablas Afectadas:** `Caja`, `MovimientoCaja`, `Pago`
- **Endpoints:** `POST /api/v1/cash-desk/open`, `POST /api/v1/cash-desk/close`, `POST /api/v1/cash-desk/transaction`
- **Criterios de Aceptación:**
  - Cada operador de caja debe realizar una apertura indicando el monto inicial en efectivo.
  - Todo pago de orden registrado (parcial o total) alimenta de forma automática el saldo de la caja activa de la sucursal.
  - Al realizar el cierre, el sistema exige ingresar el conteo físico de dinero en efectivo y calcula discrepancias, guardando auditoría estricta de diferencias detectadas.

#### TASK 11.1.2: Comunicación Interna y Notificaciones de Taller
- **Tablas Afectadas:** `NotificacionTaller`
- **Criterios de Aceptación:**
  - Panel visual de notificaciones internas en tiempo real (o por polling eficiente).
  - Alerta de inmediato a los operadores cuando una orden cambia a estado `TERMINADO` para proceder al cobro, o cuando se requiere aprobación de presupuesto urgente por parte del Supervisor.

### EPIC 12: Bitácora de Auditoría y Reportería Operativa
#### TASK 12.1.1: Motor de Auditoría Inmutable del Sistema
- **Tablas Afectadas:** `Auditoria`
- **Criterios de Aceptación:**
  - Centraliza logs de acciones del sistema. Ningún endpoint operativo o administrativo ordinario tiene permisos de actualización (`PUT`) o eliminación (`DELETE`) sobre los registros de esta tabla.

#### TASK 12.1.2: Dashboard Estadístico e Indicadores Clave de Rendimiento (KPIs)
- **Criterios de Aceptación:**
  - Construcción de vista tipo Dashboard con gráficas analíticas consumiendo datos filtrados por el contexto de empresa/sucursal:
    1. Volumen de órdenes distribuidas por estado de la máquina de estados.
    2. Gráfica de ingresos totales contra costos en un rango de fechas.
    3. Listado crítico de refacciones que se encuentran por debajo de su stock mínimo establecido.
    4. Reporte de eficiencia y horas trabajadas por técnico mecánico.

---

## ENTREGA 6: MOTOR FISCAL Y CONSOLA GLOBAL DE SUPERUSUARIO

### EPIC 13: Criptografía Fiscal y Facturación Electrónica SAT (CFDI 4.0)
#### TASK 13.1.1: Carga y Almacenamiento Seguro de Certificados de Sello Digital (CSD)
- **Tablas Afectadas:** `CertificadoFiscal`
- **Endpoints:** `POST /api/v1/fiscal/upload-csd`
- **Criterios de Aceptación:**
  - Permite la carga obligatoria de los archivos oficiales `.cer` y `.key`, además de la contraseña del certificado por empresa.
  - La llave privada `.key` debe guardarse de forma estrictamente cifrada en la base de datos o storage utilizando algoritmos simétricos robustos (ej. AES-256). El sistema nunca expone ni retorna el archivo original a través de la API pública.
  - Valida mediante código en backend la vigencia y correspondencia del RFC antes de guardar los archivos.

#### TASK 13.1.2: Generación de Estructura XML, Timbrado de CFDI y Descargas
- [x] **Tablas Afectadas:** `FacturaFiscal`, `FacturaFiscalDetalle`
- [x] **Endpoints:** `POST /api/v1/billing/issue`, `GET /api/v1/billing`, `GET /api/v1/billing/{id}/download?format=xml|pdf`
- [x] **Criterios de Aceptación:**
  - [x] A partir de una orden de trabajo completamente pagada, genera la estructura jerárquica XML requerida por el anexo 20 para CFDI 4.0 mapeando de forma correcta los conceptos a los códigos del catálogo `SatProductoServicio` y `SatUnidadMedida`.
  - [x] Realiza de manera exitosa la conexión por API con el Proveedor Autorizado de Certificación (PAC), procesando la firma digital y el timbrado. Almacena localmente el UUID retornado y el XML timbrado final.
  - [x] Implementa un manejador de errores detallado que registra la trazabilidad completa en caso de rechazo del PAC para permitir correcciones inmediatas.
  - [x] Generación dinámica de la representación impresa en formato **PDF** de la factura que incluye de forma obligatoria el desglose fiscal tradicional, cadenas de sellos digitales y el código QR fiscal oficial apuntando a la verificación del SAT.
- **Branch:** Backend `current` | Frontend `current`

### EPIC 14: Consola de Administración Global (SuperUsuario)
#### TASK 14.1.1: Panel Maestro de Monitoreo de Tenants SaaS
- [x] **Endpoints:** Acceso restringido exclusivo a `/api/v1/superadmin/*`
- [x] **Criterios de Aceptación:**
  - [x] Interfaz exclusiva para el rol `SuperUsuario` que permite listar la totalidad de las empresas registradas en la infraestructura, suspender o activar empresas (Soft-lock de acceso total), visualizar estadísticas agregadas globales de transacciones de timbrado y auditar los logs del sistema sin restricción de inquilino.
- **Branch:** Backend `5a444d5` | Frontend `feature/14.1.1-superadmin-ui`

---

## 4. Definición de Terminado (DoD - Definition of Done)

Para que cualquier historia de usuario o tarea del backlog se marque formalmente como **Terminada (`Done`)** en Antigravity, debe cumplir rigurosamente con los siguientes criterios:
1. **Código e Integración:** El código está libre de errores de sintaxis, compila correctamente y no introduce vulnerabilidades críticas.
2. **Multi-tenancy Validado:** Se comprobó a nivel de base de datos que las consultas aplican el filtro estricto de `EmpresaID` correspondiente al contexto activo de la sesión.
3. **Control de Accesos (RBAC):** El endpoint de backend y el elemento de UI correspondiente validan de forma estricta los permisos mínimos requeridos para la acción.
4. **Registro de Auditoría:** Las operaciones de creación, edición y eliminación de datos de negocio disparan e insertan de forma correcta el registro correspondiente en la tabla `Auditoria`.
5. **Manejo de Excepciones:** Se capturan de forma elegante los errores HTTP habituales devolviendo mensajes claros de diagnóstico y protegiendo el stack-trace interno del servidor.
6. **Interfaz Responsiva:** Cualquier cambio o elemento visual renderiza correctamente y es totalmente operable en pantallas de escritorio, tablets y dispositivos móviles.