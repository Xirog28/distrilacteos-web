const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a la base de datos
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error('Error conectando a MySQL:', err);
    return;
  }
  console.log('Conectado a MySQL correctamente');
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API Distrilacteos Las Cabañuelas funcionando' });
});

// Obtener todas las categorias
app.get('/api/categorias', (req, res) => {
  db.query('SELECT * FROM categorias', (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(resultados);
  });
});

// Obtener todos los productos
app.get('/api/productos', (req, res) => {
  const sql = `
    SELECT p.*, c.nombre AS categoria_nombre 
    FROM productos p
    JOIN categorias c ON p.categoria_id = c.id
    WHERE p.activo = TRUE
  `;
  db.query(sql, (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(resultados);
  });
});

// Obtener productos por categoria
app.get('/api/productos/categoria/:id', (req, res) => {
  const sql = `
    SELECT p.*, c.nombre AS categoria_nombre 
    FROM productos p
    JOIN categorias c ON p.categoria_id = c.id
    WHERE p.categoria_id = ? AND p.activo = TRUE
  `;
  db.query(sql, [req.params.id], (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(resultados);
  });
});

// Obtener un producto por id
app.get('/api/productos/:id', (req, res) => {
  const sql = `
    SELECT p.*, c.nombre AS categoria_nombre 
    FROM productos p
    JOIN categorias c ON p.categoria_id = c.id
    WHERE p.id = ?
  `;
  db.query(sql, [req.params.id], (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });
    if (resultados.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(resultados[0]);
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});