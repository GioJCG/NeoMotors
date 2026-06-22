# Matriz de Riesgos Técnicos - neoMotors

## Formato de Clasificación

| Nivel | Probabilidad | Impacto |
|---|---|---|
| Alto (3) | Muy probable (>70%) | Crítico: bloquea entregable |
| Medio (2) | Probable (30-70%) | Significativo: retrasa entregable |
| Bajo (1) | Improbable (<30%) | Menor: afecta calidad sin bloquear |

## Matriz de Riesgos

| ID | Riesgo | Descripción | Prob. | Impacto | Severidad (PxI) | Estrategia | Mitigación | Contingencia | Responsable |
|---|---|---|---|---|---|---|---|---|---|
| R-01 | Latencia en comunicación con PAC | El Proveedor Autorizado de Certificación (PAC) puede tener tiempos de respuesta lentos o intermitencias en su API durante el timbrado de CFDI, causando timeouts en la operación de facturación. | 2 | 3 | 6 (Alta) | Mitigar | Implementar timeout configurable (15s default) con reintento automático (máx 3 intentos con backoff exponencial). Usar cola de mensajes asíncrona (Bull/BullMQ) para desacoplar la petición de timbrado del flujo síncrono de la API. Almacenar el estado del timbrado en base de datos para tracking. | Si tras 3 reintentos el PAC no responde, marcar la factura como `PENDIENTE_TIMBRADO` y notificar al administrador. Habilitar reintento manual desde la UI. Cachear respuesta de verificación de UUID localmente. | Backend Developer |
| R-02 | Almacenamiento seguro de llaves privadas (.key) | El archivo .key del Certificado de Sello Digital (CSD) es el activo más crítico del módulo fiscal. Si es expuesto, cualquier entidad puede facturar a nombre de la empresa. | 2 | 3 | 6 (Alta) | Evitar | Cifrar la llave .key con AES-256-GCM antes de almacenarla en base de datos. La clave de cifrado maestra debe residir en variables de entorno del servidor (o servicio tipo Vault/HashiCorp), nunca en el código fuente ni en la base de datos. El endpoint de carga valida en backend que el .key corresponda al .cer antes de almacenar. El sistema nunca expone el archivo .key original en ninguna respuesta de la API. | Rotación inmediata de la clave maestra si se detecta acceso no autorizado. Deshabilitar certificados fiscales comprometidos desde la Consola de SuperUsuario. | Backend Developer / DevOps |
| R-03 | Consistencia en transiciones de la máquina de estados de la orden de trabajo | La Orden de Trabajo atraviesa múltiples estados (RECIBIDO → DIAGNÓSTICO → COTIZADO → APROBADO → EN_REPARACIÓN → TERMINADO → ENTREGADO). Transiciones inválidas o concurrentes pueden corromper el flujo operativo del taller. | 2 | 3 | 6 (Alta) | Evitar | Implementar la máquina de estados como un patrón State en una tabla dedicada con transiciones predefinidas validadas en base de datos mediante CHECK constraints o lógica en servicio transaccional. Usar bloqueo optimista (versión de fila) para evitar condiciones de carrera. Toda transición se registra en la tabla Auditoria con estado anterior y nuevo. | Si se detecta una transición inválida, la API rechaza la operación con error 409 Conflict y mensaje descriptivo. Panel de administración puede forzar corrección de estado como último recurso, registrándose en auditoría. | Backend Developer |
| R-04 | Rendimiento de búsquedas en catálogos masivos SAT | Los catálogos SAT (Códigos Postales: ~150k registros; Productos/Servicios: ~50k registros) son tablas grandes que pueden degradar el rendimiento de búsquedas sin índices adecuados. | 3 | 2 | 6 (Alta) | Mitigar | Crear índices compuestos en: SatCodigoPostal (código + estado + municipio), SatProductoServicio (código + descripción LIKE), SatColonia (codigoPostal + nombre). Implementar búsqueda con paginación server-side obligatoria (mínimo 25, máximo 100 registros por página). Usar búsqueda por prefijo en lugar de LIKE '%texto%' para códigos. Cachear en Redis los catálogos más consultados con TTL de 24 horas y refresco programado. | Si el tiempo de consulta excede 3 segundos, el sistema puede optar por fallback a caché local del navegador (Service Worker) para consultas repetitivas del mismo usuario en la misma sesión. | Backend Developer / DevOps |
| R-05 | Fuga de datos entre empresas (Multi-Tenancy) | Error en consultas sin filtro de companyId puede exponer datos de una empresa a usuarios de otra. | 3 | 3 | 9 (Crítica) | Evitar | Middleware global que inyecta companyId en cada consulta de negocio. Prohibir raw queries sin filtro. Prisma middleware que rechace consultas findMany/findFirst sin where.companyId. Tests de integración obligatorios con datos de 2+ empresas. | Si se detecta una consulta sin companyId en producción, el sistema registra alerta inmediata en logs de seguridad y bloquea la operación. Auditoría forense del incidente. | Backend Developer / QA |
| R-06 | Ataque de fuerza bruta en autenticación | Intentos masivos de login con credenciales robadas o generadas. | 2 | 2 | 4 (Media) | Mitigar | Rate-limiting por IP (5 intentos/minuto) y por cuenta (10 intentos/hora) usando Redis. Bloqueo temporal de cuenta tras N intentos fallidos (15 min). Notificación por email al usuario tras bloqueo. | Desbloqueo automático tras el tiempo definido. SuperUsuario puede desbloquear manualmente. | Backend Developer |
| R-07 | Token JWT comprometido | Un Access Token o Refresh Token robado puede permitir acceso no autorizado. | 2 | 3 | 6 (Alta) | Mitigar | Access Token con expiración corta (15 min). Refresh Token de larga duración (7 días) pero rotado en cada uso (token rotation). Almacenar hash del Refresh Token en base de datos para revocación. Lista negra de tokens revocados en Redis. | El usuario debe autenticarse nuevamente si intenta usar un Refresh Token ya rotado. Notificación de actividad sospechosa. | Backend Developer |
| R-08 | Inconsistencia stock vs inventario físico | Error en descuento automático de inventario al entregar orden puede causar discrepancias. | 2 | 2 | 4 (Media) | Mitigar | Toda transacción de inventario se ejecuta dentro de una transacción de base de datos. Validar stock disponible ANTES de descontar. Si no hay stock suficiente, la transición a ENTREGADO se bloquea excepto con autorización de Supervisor. Registro en MovimientoInventario con tipo de operación y referencia a OrdenTrabajo. | Ajuste manual de inventario autorizado por SupervisorSucursal con registro en auditoría. | Backend Developer |
| R-09 | Dependencia de proveedores OAuth | Los proveedores OAuth (Google, Microsoft, GitHub) pueden cambiar sus APIs o sufrir caídas. | 1 | 2 | 2 (Baja) | Aceptar | Mantener actualizadas las librerías de autenticación social. Tener auth local como respaldo funcional completo. Monitorear estado de proveedores. | Si un proveedor OAuth falla, el usuario puede usar autenticación local. Notificar en UI que el proveedor no está disponible. | Backend Developer |
| R-10 | Migraciones de Prisma conflictivas en multiempresa | Cambios en schema de base de datos pueden causar downtime o pérdida de datos. | 1 | 3 | 3 (Media) | Mitigar | Usar migraciones incrementales con `prisma migrate dev`. Validar migraciones en entorno de staging antes de producción. Nunca eliminar columnas sin antes verificar que no hay datos dependientes. Tener script de rollback para cada migración. | Ejecutar migración de reversión desde backup. Restaurar base de datos desde backup si es necesario. | Backend Developer / DevOps |

## Supuestos Técnicos

1. El PAC utilizado tendrá disponibilidad mínima del 99.5% en horario operativo (7:00-23:00).
2. PostgreSQL 15+ será el motor de base de datos con soporte para índices parciales y JSONB.
3. Redis estará disponible como caché distribuido y store para rate-limiting y sesiones.
4. El navegador soporta ES2020+ para características de cifrado nativo (Web Crypto API).
5. Los archivos CSD (.cer/.key) no superan 5 MB cada uno.
6. El tiempo de respuesta esperado del PAC es menor a 10 segundos en condiciones normales.
7. Se cuenta con bucket S3 compatible (MinIO, AWS S3, Backblaze) para almacenamiento de archivos.
8. Las variables de entorno sensibles se gestionan mediante secrets de la infraestructura (nunca en .env del repositorio).

## Plan de Contingencia General

| Escenario | Acción | Tiempo respuesta |
|---|---|---|
| PAC caído por más de 30 min | Cambiar a PAC secundario configurado en empresa | 15 min |
 | Fuga de datos detectada | Bloquear tenant afectado, desactivar accesos, auditoría forense | Inmediato |
| Error crítico en base de datos | Activar réplica de sólo lectura, escalar a DBA | 10 min |
| Llave maestra de cifrado comprometida | Rotar clave, forzar relogueo de todos los usuarios, auditoría completa | 30 min |
