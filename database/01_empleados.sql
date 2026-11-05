/*
    Base de datos para el sistema de gestión de empleados.
    Ejecutar este archivo desde SQL Server Management Studio o sqlcmd.
*/

IF DB_ID(N'EmpleadosDB') IS NULL
BEGIN
    CREATE DATABASE EmpleadosDB;
END;
GO

USE EmpleadosDB;
GO

IF OBJECT_ID(N'dbo.Areas', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Areas
    (
        AreaId       INT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_Areas PRIMARY KEY,
        Nombre       NVARCHAR(100) NOT NULL,
        Descripcion  NVARCHAR(250) NULL,
        Activa       BIT NOT NULL
            CONSTRAINT DF_Areas_Activa DEFAULT (1),
        FechaCreacion DATETIME2(0) NOT NULL
            CONSTRAINT DF_Areas_FechaCreacion DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT UQ_Areas_Nombre UNIQUE (Nombre)
    );
END;
GO

IF OBJECT_ID(N'dbo.Empleados', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Empleados
    (
        EmpleadoId       INT IDENTITY(1, 1) NOT NULL
            CONSTRAINT PK_Empleados PRIMARY KEY,
        Nombre           NVARCHAR(100) NOT NULL,
        Apellido         NVARCHAR(100) NOT NULL,
        Correo           NVARCHAR(254) NOT NULL,
        Telefono         NVARCHAR(30) NULL,
        Documento        NVARCHAR(50) NULL,
        FechaNacimiento  DATE NULL,
        FechaIngreso     DATE NOT NULL
            CONSTRAINT DF_Empleados_FechaIngreso DEFAULT (CONVERT(date, GETDATE())),
        Cargo            NVARCHAR(100) NULL,
        AreaId           INT NOT NULL,
        Activo           BIT NOT NULL
            CONSTRAINT DF_Empleados_Activo DEFAULT (1),
        FechaCreacion    DATETIME2(0) NOT NULL
            CONSTRAINT DF_Empleados_FechaCreacion DEFAULT (SYSUTCDATETIME()),
        FechaActualizacion DATETIME2(0) NULL,
        CONSTRAINT FK_Empleados_Areas
            FOREIGN KEY (AreaId) REFERENCES dbo.Areas (AreaId),
        CONSTRAINT UQ_Empleados_Correo UNIQUE (Correo),
        CONSTRAINT CK_Empleados_Correo
            CHECK (Correo LIKE '%_@_%._%'),
        CONSTRAINT CK_Empleados_Fechas
            CHECK (FechaNacimiento IS NULL OR FechaNacimiento <= FechaIngreso)
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Areas)
BEGIN
    INSERT INTO dbo.Areas (Nombre, Descripcion)
    VALUES
        (N'Recursos Humanos', N'Gestión del talento y personal'),
        (N'Tecnología', N'Desarrollo y soporte tecnológico'),
        (N'Finanzas', N'Administración financiera y contable'),
        (N'Operaciones', N'Gestión de operaciones');
END;
GO

CREATE OR ALTER VIEW dbo.vw_Empleados
AS
SELECT
    e.EmpleadoId,
    e.Nombre,
    e.Apellido,
    CONCAT(e.Nombre, N' ', e.Apellido) AS NombreCompleto,
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
FROM dbo.Empleados AS e
INNER JOIN dbo.Areas AS a ON a.AreaId = e.AreaId;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Empleado_Listar
    @IncluirInactivos BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM dbo.vw_Empleados
    WHERE @IncluirInactivos = 1 OR Activo = 1
    ORDER BY Apellido, Nombre;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Empleado_Obtener
    @EmpleadoId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM dbo.vw_Empleados
    WHERE EmpleadoId = @EmpleadoId;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Empleado_Crear
    @Nombre NVARCHAR(100),
    @Apellido NVARCHAR(100),
    @Correo NVARCHAR(254),
    @Telefono NVARCHAR(30) = NULL,
    @Documento NVARCHAR(50) = NULL,
    @FechaNacimiento DATE = NULL,
    @FechaIngreso DATE = NULL,
    @Cargo NVARCHAR(100) = NULL,
    @AreaId INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    INSERT INTO dbo.Empleados
    (
        Nombre, Apellido, Correo, Telefono, Documento, FechaNacimiento,
        FechaIngreso, Cargo, AreaId
    )
    VALUES
    (
        TRIM(@Nombre), TRIM(@Apellido), LOWER(TRIM(@Correo)), NULLIF(TRIM(@Telefono), N''),
        NULLIF(TRIM(@Documento), N''), @FechaNacimiento, COALESCE(@FechaIngreso, CONVERT(date, GETDATE())),
        NULLIF(TRIM(@Cargo), N''), @AreaId
    );

    SELECT *
    FROM dbo.vw_Empleados
    WHERE EmpleadoId = SCOPE_IDENTITY();
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Empleado_Actualizar
    @EmpleadoId INT,
    @Nombre NVARCHAR(100),
    @Apellido NVARCHAR(100),
    @Correo NVARCHAR(254),
    @Telefono NVARCHAR(30) = NULL,
    @Documento NVARCHAR(50) = NULL,
    @FechaNacimiento DATE = NULL,
    @FechaIngreso DATE,
    @Cargo NVARCHAR(100) = NULL,
    @AreaId INT,
    @Activo BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE dbo.Empleados
    SET Nombre = TRIM(@Nombre),
        Apellido = TRIM(@Apellido),
        Correo = LOWER(TRIM(@Correo)),
        Telefono = NULLIF(TRIM(@Telefono), N''),
        Documento = NULLIF(TRIM(@Documento), N''),
        FechaNacimiento = @FechaNacimiento,
        FechaIngreso = @FechaIngreso,
        Cargo = NULLIF(TRIM(@Cargo), N''),
        AreaId = @AreaId,
        Activo = @Activo,
        FechaActualizacion = SYSUTCDATETIME()
    WHERE EmpleadoId = @EmpleadoId;

    SELECT *
    FROM dbo.vw_Empleados
    WHERE EmpleadoId = @EmpleadoId;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Empleado_Eliminar
    @EmpleadoId INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    UPDATE dbo.Empleados
    SET Activo = 0,
        FechaActualizacion = SYSUTCDATETIME()
    WHERE EmpleadoId = @EmpleadoId;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Area_Listar
    @IncluirInactivas BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    SELECT AreaId, Nombre, Descripcion, Activa
    FROM dbo.Areas
    WHERE @IncluirInactivas = 1 OR Activa = 1
    ORDER BY Nombre;
END;
GO
