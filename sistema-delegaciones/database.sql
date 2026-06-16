-- Script para crear la base de datos
CREATE DATABASE IF NOT EXISTS sistema_delegaciones;
USE sistema_delegaciones;

-- Tabla de personas
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

-- Tabla de auditoría
CREATE TABLE IF NOT EXISTS auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    persona_id INT,
    accion VARCHAR(50),
    datos_anteriores JSON,
    datos_nuevos JSON,
    usuario VARCHAR(100),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (persona_id) REFERENCES personas(id) ON DELETE CASCADE,
    INDEX idx_persona (persona_id),
    INDEX idx_fecha (fecha_cambio)
);

-- Insertar datos de prueba
INSERT INTO personas (curp, rfc, numero_empleado, nombre, apellido_paterno, apellido_materno, delegacion, tipo_institucion, correo, telefono, creado_por) VALUES
('AABB123456HDFZZZ01', 'AABB123456ABC', 1001, 'Juan', 'Pérez', 'García', 'CDMX', 'Hospital', 'juan@example.com', '5511223344', 'admin'),
('CCDD234567MDFZZZ02', 'CCDD234567DEF', 1002, 'María', 'López', 'Rodríguez', 'Jalisco', 'Centro de Salud', 'maria@example.com', '5522334455', 'admin'),
('EEFF345678HDFZZZ03', 'EEFF345678GHI', 1003, 'Carlos', 'González', 'Martínez', 'Monterrey', 'Clínica', 'carlos@example.com', '5533445566', 'admin');

-- Crear eventos para limpieza automática de registros antiguos (opcional)
DELIMITER //
CREATE EVENT IF NOT EXISTS limpiar_auditoria
ON SCHEDULE EVERY 30 DAY
DO
BEGIN
    DELETE FROM auditoria WHERE DATE(fecha_cambio) < DATE_SUB(NOW(), INTERVAL 90 DAY);
END//
DELIMITER ;
