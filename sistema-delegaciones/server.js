const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const XLSX = require('xlsx');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuración Multer para subir archivos
const upload = multer({ dest: 'uploads/' });

// Pool de conexión a la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_delegaciones',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Conectar a la BD y crear tablas
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS personas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        curp CHAR(18) NOT NULL UNIQUE,
        rfc VARCHAR(13),
        numero_empleado INT UNIQUE,
        nombre VARCHAR(150) NOT NULL,
        apellido_paterno VARCHAR(100),
        apellido_materno VARCHAR(100),
        delegacion VARCHAR(100),
        tipo_institucion ENUM('Hospital', 'Centro de Salud', 'Jurisdicción', 'Clínica', 'Centro Comunitario', 'Otros') NOT NULL,
        correo VARCHAR(150),
        telefono VARCHAR(15),
        estado VARCHAR(50) DEFAULT 'activo',
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        creado_por VARCHAR(100),
        actualizado_por VARCHAR(100),
        INDEX idx_curp (curp),
        INDEX idx_rfc (rfc),
        INDEX idx_numero_empleado (numero_empleado),
        INDEX idx_delegacion (delegacion),
        INDEX idx_tipo_institucion (tipo_institucion)
      );
    `;
    
    await connection.query(createTableSQL);
    console.log('✅ Tabla "personas" lista');
    
    // Crear tabla de auditoría
    const auditTableSQL = `
      CREATE TABLE IF NOT EXISTS auditoria (
        id INT AUTO_INCREMENT PRIMARY KEY,
        persona_id INT,
        accion VARCHAR(50),
        datos_anteriores JSON,
        datos_nuevos JSON,
        usuario VARCHAR(100),
        fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (persona_id) REFERENCES personas(id)
      );
    `;
    
    await connection.query(auditTableSQL);
    console.log('✅ Tabla "auditoria" lista');
    
    connection.release();
  } catch (error) {
    console.error('❌ Error inicializando BD:', error.message);
  }
}

initializeDatabase();

// ==================== RUTAS ====================

// 1. OBTENER TODAS LAS PERSONAS (con filtros)
app.get('/api/personas', async (req, res) => {
  try {
    const { 
      curp, 
      rfc, 
      numero_empleado, 
      nombre, 
      delegacion, 
      tipo_institucion, 
      estado,
      pagina = 1,
      limite = 50 
    } = req.query;

    let query = 'SELECT * FROM personas WHERE 1=1';
    const params = [];

    if (curp) {
      query += ' AND curp LIKE ?';
      params.push(`%${curp}%`);
    }
    if (rfc) {
      query += ' AND rfc LIKE ?';
      params.push(`%${rfc}%`);
    }
    if (numero_empleado) {
      query += ' AND numero_empleado = ?';
      params.push(numero_empleado);
    }
    if (nombre) {
      query += ' AND (nombre LIKE ? OR apellido_paterno LIKE ? OR apellido_materno LIKE ?)';
      params.push(`%${nombre}%`, `%${nombre}%`, `%${nombre}%`);
    }
    if (delegacion) {
      query += ' AND delegacion = ?';
      params.push(delegacion);
    }
    if (tipo_institucion) {
      query += ' AND tipo_institucion = ?';
      params.push(tipo_institucion);
    }
    if (estado) {
      query += ' AND estado = ?';
      params.push(estado);
    }

    // Contar total de registros
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const connection = await pool.getConnection();
    const [countResult] = await connection.query(countQuery, params);
    const total = countResult[0].total;

    // Paginación
    const offset = (pagina - 1) * limite;
    query += ` ORDER BY fecha_actualizacion DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limite), offset);

    const [personas] = await connection.query(query, params);
    connection.release();

    res.json({
      success: true,
      total,
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      totalPaginas: Math.ceil(total / limite),
      datos: personas
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. OBTENER UNA PERSONA POR ID
app.get('/api/personas/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [personas] = await connection.query('SELECT * FROM personas WHERE id = ?', [req.params.id]);
    connection.release();

    if (personas.length === 0) {
      return res.status(404).json({ success: false, error: 'Persona no encontrada' });
    }

    res.json({ success: true, datos: personas[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. CREAR NUEVA PERSONA
app.post('/api/personas', async (req, res) => {
  try {
    const { curp, rfc, numero_empleado, nombre, apellido_paterno, apellido_materno, delegacion, tipo_institucion, correo, telefono, creado_por } = req.body;

    if (!curp || !nombre || !tipo_institucion) {
      return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO personas (curp, rfc, numero_empleado, nombre, apellido_paterno, apellido_materno, delegacion, tipo_institucion, correo, telefono, creado_por) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [curp, rfc, numero_empleado, nombre, apellido_paterno, apellido_materno, delegacion, tipo_institucion, correo, telefono, creado_por]
    );

    // Notificar a través de WebSocket
    io.emit('persona-nueva', { id: result.insertId, ...req.body });

    connection.release();

    res.status(201).json({ success: true, id: result.insertId, mensaje: 'Persona creada exitosamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. ACTUALIZAR PERSONA
app.put('/api/personas/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [personaActual] = await connection.query('SELECT * FROM personas WHERE id = ?', [req.params.id]);

    if (personaActual.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, error: 'Persona no encontrada' });
    }

    const { nombre, apellido_paterno, apellido_materno, delegacion, tipo_institucion, correo, telefono, estado, actualizado_por } = req.body;

    const [result] = await connection.query(
      'UPDATE personas SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, delegacion = ?, tipo_institucion = ?, correo = ?, telefono = ?, estado = ?, actualizado_por = ? WHERE id = ?',
      [nombre, apellido_paterno, apellido_materno, delegacion, tipo_institucion, correo, telefono, estado, actualizado_por, req.params.id]
    );

    // Registrar en auditoría
    await connection.query(
      'INSERT INTO auditoria (persona_id, accion, datos_anteriores, datos_nuevos, usuario) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, 'ACTUALIZACIÓN', JSON.stringify(personaActual[0]), JSON.stringify(req.body), actualizado_por]
    );

    // Notificar cambio a todos los clientes conectados
    io.emit('persona-actualizada', { id: req.params.id, ...req.body });

    connection.release();

    res.json({ success: true, mensaje: 'Persona actualizada exitosamente' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. ELIMINAR PERSONA
app.delete('/api/personas/:id', async (req, res) => {
  try {
    const { eliminado_por } = req.body;
    const connection = await pool.getConnection();

    const [personaActual] = await connection.query('SELECT * FROM personas WHERE id = ?', [req.params.id]);

    await connection.query('DELETE FROM personas WHERE id = ?', [req.params.id]);

    // Registrar en auditoría
    await connection.query(
      'INSERT INTO auditoria (persona_id, accion, datos_anteriores, usuario) VALUES (?, ?, ?, ?)',
      [req.params.id, 'ELIMINACIÓN', JSON.stringify(personaActual[0]), eliminado_por]
    );

    io.emit('persona-eliminada', { id: req.params.id });

    connection.release();

    res.json({ success: true, mensaje: 'Persona eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. IMPORTAR DESDE EXCEL
app.post('/api/importar-excel', upload.single('archivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No se subió archivo' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const datos = XLSX.utils.sheet_to_json(hoja);

    const connection = await pool.getConnection();
    let insertados = 0;
    let errores = [];

    for (const fila of datos) {
      try {
        await connection.query(
          'INSERT INTO personas (curp, rfc, numero_empleado, nombre, apellido_paterno, apellido_materno, delegacion, tipo_institucion, correo, telefono) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [fila.curp, fila.rfc, fila.numero_empleado, fila.nombre, fila.apellido_paterno, fila.apellido_materno, fila.delegacion, fila.tipo_institucion, fila.correo, fila.telefono]
        );
        insertados++;
      } catch (err) {
        errores.push(`Fila ${fila.nombre}: ${err.message}`);
      }
    }

    connection.release();

    // Notificar a todos los clientes
    io.emit('datos-importados', { insertados, total: datos.length });

    res.json({ success: true, insertados, total: datos.length, errores });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. OBTENER ESTADÍSTICAS
app.get('/api/estadisticas', async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [total] = await connection.query('SELECT COUNT(*) as total FROM personas');
    const [porDelegacion] = await connection.query('SELECT delegacion, COUNT(*) as cantidad FROM personas GROUP BY delegacion');
    const [porTipo] = await connection.query('SELECT tipo_institucion, COUNT(*) as cantidad FROM personas GROUP BY tipo_institucion');

    connection.release();

    res.json({
      success: true,
      total: total[0].total,
      porDelegacion,
      porTipo
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== WEBSOCKET ====================
io.on('connection', (socket) => {
  console.log(`✅ Cliente conectado: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });
});

// ==================== INICIAR SERVIDOR ====================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});
