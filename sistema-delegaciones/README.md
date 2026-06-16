
# 🏥 Sistema de Delegaciones con Base de Datos Compartida

Un **sistema web completo** para gestionar hasta **15,000 registros** de personas con:
- ✅ Interfaz moderna y responsiva
- ✅ Buscador y filtros avanzados
- ✅ Notificaciones en tiempo real
- ✅ Importación desde Excel
- ✅ Sincronización en vivo con WebSocket
- ✅ Auditoría de cambios

---

## 📋 Características

### 1. **Gestión de Datos**
- Buscar por CURP, RFC, número de empleado, nombre
- Filtrar por delegación y tipo de institución
- Crear, editar y eliminar registros
- Validación de duplicados automática

### 2. **Tipos de Institución**
- Hospital
- Centro de Salud
- Jurisdicción
- Clínica
- Centro Comunitario
- Otros

### 3. **Importación de Excel**
- Soporta archivos .xlsx, .xls, .csv
- Importación en lote de miles de registros
- Validación de datos en tiempo real

### 4. **Notificaciones en Tiempo Real**
- WebSocket para actualizaciones instantáneas
- Notificaciones en la interfaz cuando hay cambios
- Múltiples usuarios conectados simultáneamente

### 5. **Estadísticas**
- Total de personas
- Desglose por tipo de institución
- Información en tiempo real

---

## 🛠️ Instalación

### **Requisitos**
- Node.js 14+
- MySQL 5.7+
- npm

### **Pasos**

1. **Clonar o descargar el proyecto**
```bash
cd sistema-delegaciones
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Crear la base de datos**
```bash
mysql -u root -p < database.sql
```
(Ingresa tu contraseña de MySQL cuando se solicite)

4. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Edita `.env` con tus datos:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=sistema_delegaciones
DB_PORT=3306
PORT=3000
```

5. **Iniciar el servidor**
```bash
npm start
```

El sistema estará disponible en: **http://localhost:3000**

---

## 📂 Estructura del Proyecto

```
sistema-delegaciones/
├── server.js                    # Servidor principal
├── package.json                 # Dependencias
├── .env.example                 # Configuración de ejemplo
├── database.sql                 # Script SQL
├── public/
│   ├── index.html              # Página principal
│   ├── app.js                  # Lógica del frontend
│   └── styles.css              # Estilos (en index.html)
└── uploads/                     # Carpeta para archivos importados
```

---

## 🚀 Uso

### **Agregar una Persona**
1. Haz clic en "➕ Agregar Persona"
2. Completa los campos (CURP, nombre, tipo de institución son obligatorios)
3. Haz clic en "Guardar"

### **Buscar Personas**
- Usa los campos de búsqueda en la parte superior
- Los resultados se actualizan en tiempo real
- Usa múltiples criterios para búsquedas más específicas

### **Filtrar por Categoría**
- Haz clic en los botones de delegación o tipo de institución
- Los filtros se pueden combinar
- Haz clic nuevamente para desactivar un filtro

### **Editar una Persona**
1. Haz clic en el botón ✏️ en la fila
2. Modifica los datos
3. Haz clic en "Guardar Cambios"

### **Eliminar una Persona**
1. Haz clic en el botón 🗑️ en la fila
2. Confirma la eliminación

### **Importar desde Excel**
1. Haz clic en "⬆️ Importar Excel"
2. Selecciona tu archivo
3. El sistema validará e importará automáticamente

**Formato esperado del Excel:**
| CURP | RFC | numero_empleado | nombre | apellido_paterno | apellido_materno | delegacion | tipo_institucion | correo | telefono |
|------|-----|-----------------|--------|------------------|------------------|------------|------------------|--------|----------|

---

## 🔌 API REST

### **Obtener todas las personas (con filtros)**
```bash
GET /api/personas?pagina=1&limite=50&curp=ABC&delegacion=CDMX
```

### **Obtener una persona por ID**
```bash
GET /api/personas/:id
```

### **Crear una persona**
```bash
POST /api/personas
Content-Type: application/json

{
  "curp": "AABB123456HDFZZZ01",
  "rfc": "AABB123456ABC",
  "numero_empleado": 1001,
  "nombre": "Juan",
  "apellido_paterno": "Pérez",
  "tipo_institucion": "Hospital",
  "delegacion": "CDMX",
  "correo": "juan@example.com"
}
```

### **Actualizar una persona**
```bash
PUT /api/personas/:id
Content-Type: application/json

{
  "nombre": "Juan Carlos",
  "delegacion": "Jalisco",
  "actualizado_por": "usuario"
}
```

### **Eliminar una persona**
```bash
DELETE /api/personas/:id
Content-Type: application/json

{
  "eliminado_por": "usuario"
}
```

### **Obtener estadísticas**
```bash
GET /api/estadisticas
```

### **Importar desde Excel**
```bash
POST /api/importar-excel
Content-Type: multipart/form-data

archivo: [archivo.xlsx]
```

---

## 🔔 WebSocket Events

El sistema emite eventos en tiempo real:

- **`persona-nueva`**: Cuando se agrega una nueva persona
- **`persona-actualizada`**: Cuando se actualiza un registro
- **`persona-eliminada`**: Cuando se elimina un registro
- **`datos-importados`**: Cuando se completa una importación
- **`disconnect`**: Cuando un cliente se desconecta
- **`connect`**: Cuando un cliente se conecta

---

## 📊 Base de Datos

### Tabla: `personas`
- `id`: ID único
- `curp`: Identificador CURP (18 caracteres)
- `rfc`: Identificador RFC
- `numero_empleado`: Número de empleado único
- `nombre`: Nombre completo
- `apellido_paterno`: Apellido paterno
- `apellido_materno`: Apellido materno
- `delegacion`: Delegación/Departamento
- `tipo_institucion`: Tipo de institución
- `correo`: Correo electrónico
- `telefono`: Teléfono
- `estado`: Estado (activo/inactivo)
- `fecha_registro`: Timestamp de creación
- `fecha_actualizacion`: Timestamp de última actualización
- `creado_por`: Usuario que creó el registro
- `actualizado_por`: Usuario que actualizó el registro

### Tabla: `auditoria`
Registra todos los cambios para auditoría:
- `persona_id`: ID de la persona modificada
- `accion`: CREACIÓN, ACTUALIZACIÓN, ELIMINACIÓN
- `datos_anteriores`: JSON con datos previos
- `datos_nuevos`: JSON con datos nuevos
- `usuario`: Usuario que realizó el cambio
- `fecha_cambio`: Timestamp del cambio

---

## 🎨 Personalización

### Cambiar delegaciones
Edita en `public/app.js`:
```javascript
const delegaciones = ['CDMX', 'Jalisco', 'Monterrey', 'Guadalajara', 'Puebla', 'Cancún', 'Mérida'];
```

### Cambiar colores
Edita en `public/index.html` o `public/app.js`:
```javascript
const coloresTipo = {
    'Hospital': '#dc3545',
    'Centro de Salud': '#28a745',
    // ...
};
```

### Cambiar cantidad de registros por página
En `public/app.js`:
```javascript
const elementosPorPagina = 50; // Cambiar a 100, 200, etc.
```

---

## 🔒 Seguridad

- ✅ Validación de entrada en frontend y backend
- ✅ SQL Prepared Statements (previene SQL injection)
- ✅ CORS habilitado (configurable)
- ✅ Auditoría de cambios
- ✅ Validación de duplicados
- ✅ Índices en campos de búsqueda frecuentes

---

## 📈 Rendimiento

- ✅ Soporta hasta 15,000+ registros
- ✅ Búsqueda rápida con índices
- ✅ Paginación de 50 registros por página
- ✅ WebSocket para actualizaciones sin rechazar
- ✅ Pool de conexiones de BD

---

## 🐛 Troubleshooting

### **Error: "Cannot find module 'express'"**
```bash
npm install
```

### **Error: "Connection refused" en MySQL**
Verifica que MySQL esté ejecutándose y que las credenciales en `.env` sean correctas.

### **Los datos no se actualizan en tiempo real**
Verifica que WebSocket esté activo. Abre la consola del navegador (F12) y busca errores.

### **Importación de Excel falla**
- Verifica que el archivo esté en formato .xlsx, .xls o .csv
- Verifica que las columnas tengan exactamente los nombres esperados
- Verifica que no haya celdas vacías en campos obligatorios

---

## 📞 Soporte

Para reportar problemas o sugerencias, crea un issue en el repositorio.

---

## 📄 Licencia

Este proyecto está bajo licencia ISC.

---

## 👨‍💻 Autor

Creado por: **Tu Nombre**
Fecha: 2025

---

**¡Listo! Tu sistema está completo y funcionando.** 🎉
