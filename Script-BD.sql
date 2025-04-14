create database db_a8b242_conta

-- Crear tabla empresas
CREATE TABLE empresas (
    idEmpresa BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ruc VARCHAR(11) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    fecRegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla roles
CREATE TABLE roles (
    idRol SMALLINT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL UNIQUE
);

-- Crear tabla usuarios
CREATE TABLE usuarios (
    idUsuarios BIGINT AUTO_INCREMENT PRIMARY KEY,
    idEmpresa BIGINT NOT NULL,
    idRol smallint NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fecCreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idEmpresa) REFERENCES empresas(idEmpresa),
    FOREIGN KEY (idRol) REFERENCES roles(idRol)
);

-- Crear tabla plan_cuentas
CREATE TABLE plan_cuentas (
    idPlanCuentas BIGINT AUTO_INCREMENT PRIMARY KEY,
	-- idEmpresa BIGINT NOT NULL,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    categoria VARCHAR(1), -- A = ACTIVO, P = PASIVO, N = NATURALEZA, F = FUNCION , R = NATURALEZA Y FUNCION 
	estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	-- ,FOREIGN KEY (idEmpresa) REFERENCES empresas(idEmpresa)
);


-- Crear tabla Transacciones
CREATE TABLE transacciones (
    idTransaccion BIGINT AUTO_INCREMENT PRIMARY KEY,
    idEmpresa BIGINT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	glosa VARCHAR(200) NULL,
    -- estado ENUM('Activo', 'Anulado') DEFAULT 'Activo',
	estado BOOLEAN DEFAULT TRUE,
    importe DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (idEmpresa) REFERENCES empresas(idEmpresa) ON DELETE CASCADE
);

-- Crear tabla detalle_transacciones
CREATE TABLE detalle_transacciones (
    idDetalle BIGINT AUTO_INCREMENT PRIMARY KEY,
    idTransaccion BIGINT NOT NULL,
    idPlanCuentas BIGINT NOT NULL,
    item INT NOT NULL CHECK (item > 0),
	importe_debe DECIMAL(10,2) NOT NULL DEFAULT 0,
    importe_haber DECIMAL(10,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (idTransaccion) REFERENCES transacciones(idTransaccion) ON DELETE CASCADE,
    FOREIGN KEY (idPlanCuentas) REFERENCES plan_cuentas(idPlanCuentas)
);



INSERT INTO roles (descripcion) VALUES 
('Administrador'),
('Desarrollador'),
('Usuario');

INSERT INTO plan_cuentas (codigo, nombre, categoria)
VALUES
('10', 'EFECTIVO Y EQUIVALENTES DE EFECTIVO', 'A'),
('12', 'CUENTAS POR COBRAR COMERCIALES TERCEROS', 'A'),
('14', 'CUENTAS POR COBRAR AL PERSONAL, A LOS ACCIONISTAS (SOCIOS) y DIRECTORES', 'A'),
('20', 'MERCADERÍAS', 'A'),
('33', 'PROPIEDAD, PLANTA Y EQUIPO', 'A'),
('40', 'TRIBUTOS, CONTRAPRESTACIONES Y APORTES AL SISTEMA PÚBLICO DE PENSIONES Y DE SALUD POR PAGAR', 'P'),
('41', 'REMUNERACIONES Y PARTICIPACIONES POR PAGAR', 'P'),
('42', 'CUENTAS POR PAGAR COMERCIALES TERCEROS', 'P'),
('45', 'OBLIGACIONES FINANCIERAS', 'P'),
('50', 'CAPITAL', 'P'),
('60', 'COMPRAS', 'N'),
('61', 'VARIACIÓN DE INVENTARIOS', 'N'),
('62', 'GASTOS DE PERSONAL Y DIRECTORES', 'N'),
('63', 'GASTOS DE SERVICIOS PRESTADOS POR TERCEROS', 'N'),
('66', 'PERDIDA POR MEDICIÓN DE ACTIVOS NO FINANCIEROS AL VALOR RAZONABLE', 'N'),
('67', 'GASTOS FINANCIEROS', 'N'),
('69', 'COSTO DE VENTAS', 'R'),
('70', 'VENTAS', 'R'),
('77', 'INGRESOS FINANCIEROS', 'R'),
('79', 'CARGAS IMPUTABLES A CUENTAS DE COSTOS Y GASTOS', NULL),
('90', 'COSTO DE PRODUCCIÓN', 'F'),
('94', 'GASTOS ADMINISTRATIVOS', 'F'),
('95', 'GASTOS DE VENTAS', 'F'),
('97', 'GASTOS FINANCIEROS', 'F');
