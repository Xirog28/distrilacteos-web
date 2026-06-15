-- =============================================
-- BASE DE DATOS: distrilacteos_db
-- Distrilacteos Las Cabañuelas · Bogotá 2026
-- =============================================

CREATE DATABASE IF NOT EXISTS distrilacteos_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_spanish_ci;

USE distrilacteos_db;

-- Tabla categorias
CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla productos
CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  marca VARCHAR(100),
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  imagen_url VARCHAR(500),
  categoria_id INT,
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- Tabla usuarios
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('admin') DEFAULT 'admin',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- DATOS DE PRUEBA
-- =============================================

INSERT INTO categorias (nombre, descripcion) VALUES
('Lácteos', 'Quesos, mantequilla, yogurt, leche condensada y más'),
('Embutidos', 'Salchichón, mortadela, jamón y carnes frías'),
('Congelados', 'Productos congelados para comidas rápidas'),
('Salsas', 'Salsas para uso comercial y doméstico'),
('Dulces y Repostería', 'Chocolate, aceite de coco, leche condensada y más');

INSERT INTO productos (nombre, marca, descripcion, precio, stock, categoria_id) VALUES
('Queso Campesino', 'Colanta', 'Queso fresco ideal para consumo diario y cocina', 12000, 50, 1),
('Yogurt Griego Natural', 'Alpina', 'Yogurt griego sin azúcar añadida, alto en proteína', 7500, 30, 1),
('Mantequilla sin sal', 'Lurpak', 'Mantequilla premium para repostería y cocina', 18000, 20, 1),
('Salchichón Cervecero', 'Zenú', 'Salchichón tradicional de alta calidad', 8500, 40, 2),
('Mortadela', 'Zenú', 'Mortadela clásica en diferentes presentaciones', 6000, 35, 2),
('Jamón Serrano', 'Rica', 'Jamón de alta calidad para sándwiches y tablas', 9500, 25, 2),
('Papa Precocida', 'McCain', 'Papa lista para freír, ideal para comidas rápidas', 15000, 60, 3),
('Nuggets de Pollo', 'Zenú', 'Nuggets listos para freír u hornear', 12000, 45, 3),
('Salsa de Tomate', 'Fruco', 'Salsa de tomate para uso comercial y doméstico', 5000, 80, 4),
('Mayonesa', 'Fruco', 'Mayonesa tradicional en presentación grande', 8000, 70, 4),
('Chocolate en Chispas', 'Corona', 'Ideal para repostería y preparaciones dulces', 9000, 15, 5),
('Leche Condensada', 'La Lechera', 'Leche condensada azucarada para postres', 7000, 25, 5);