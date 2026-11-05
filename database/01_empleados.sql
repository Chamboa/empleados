-- Base de datos MySQL para XAMPP.
-- Ejecutar desde phpMyAdmin o desde la consola de MySQL.

CREATE DATABASE IF NOT EXISTS empleados_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE empleados_db;

CREATE TABLE IF NOT EXISTS areas (
  AreaId INT NOT NULL AUTO_INCREMENT,
  Nombre VARCHAR(100) NOT NULL,
  Descripcion VARCHAR(250) NULL,
  Activa TINYINT(1) NOT NULL DEFAULT 1,
  FechaCreacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (AreaId),
  UNIQUE KEY UQ_Areas_Nombre (Nombre)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS empleados (
  EmpleadoId INT NOT NULL AUTO_INCREMENT,
  Nombre VARCHAR(100) NOT NULL,
  Apellido VARCHAR(100) NOT NULL,
  Correo VARCHAR(254) NOT NULL,
  Telefono VARCHAR(30) NULL,
  Documento VARCHAR(50) NULL,
  FechaNacimiento DATE NULL,
  FechaIngreso DATE NOT NULL DEFAULT (CURRENT_DATE),
  Cargo VARCHAR(100) NULL,
  AreaId INT NOT NULL,
  Activo TINYINT(1) NOT NULL DEFAULT 1,
  FechaCreacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FechaActualizacion TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (EmpleadoId),
  UNIQUE KEY UQ_Empleados_Correo (Correo),
  CONSTRAINT FK_Empleados_Areas
    FOREIGN KEY (AreaId) REFERENCES areas (AreaId),
  CONSTRAINT CK_Empleados_Fechas
    CHECK (FechaNacimiento IS NULL OR FechaNacimiento <= FechaIngreso)
) ENGINE=InnoDB;

INSERT IGNORE INTO areas (Nombre, Descripcion) VALUES
  ('Recursos Humanos', 'Gestión del talento y personal'),
  ('Tecnología', 'Desarrollo y soporte tecnológico'),
  ('Finanzas', 'Administración financiera y contable'),
  ('Operaciones', 'Gestión de operaciones');

CREATE OR REPLACE VIEW vw_Empleados AS
SELECT
  e.EmpleadoId,
  e.Nombre,
  e.Apellido,
  CONCAT(e.Nombre, ' ', e.Apellido) AS NombreCompleto,
  e.Correo,
  e.Telefono,
  e.Documento,
  e.FechaNacimiento,
  e.FechaIngreso,
  e.Cargo,
  e.AreaId,
  a.Nombre AS AreaNombre,
  e.Activo,
  e.FechaCreacion,
  e.FechaActualizacion
FROM empleados e
INNER JOIN areas a ON a.AreaId = e.AreaId;
