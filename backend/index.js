const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

// =============================================
// MIDDLEWARE - Verificar token JWT
// =============================================
function verificarToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// =============================================
// RUTAS PÚBLICAS
// =============================================

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

// =============================================
// RUTAS DE AUTENTICACIÓN
// =============================================

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });
    if (resultados.length === 0) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const usuario = resultados[0];
    const passwordValida = bcrypt.compareSync(password, usuario.password_hash);
    if (!passwordValida) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, nombre: usuario.nombre });
  });
});

// =============================================
// RUTAS ADMIN - Protegidas con JWT
// =============================================

// Obtener todos los productos (incluyendo inactivos)
app.get('/api/admin/productos', verificarToken, (req, res) => {
  const sql = `
    SELECT p.*, c.nombre AS categoria_nombre 
    FROM productos p
    JOIN categorias c ON p.categoria_id = c.id
    ORDER BY p.creado_en DESC
  `;
  db.query(sql, (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(resultados);
  });
});

// Agregar producto
app.post('/api/admin/productos', verificarToken, (req, res) => {
  const { nombre, marca, descripcion, precio, stock, imagen_url, categoria_id } = req.body;
  const sql = 'INSERT INTO productos (nombre, marca, descripcion, precio, stock, imagen_url, categoria_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [nombre, marca, descripcion, precio, stock, imagen_url, categoria_id], (err, resultado) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Producto agregado', id: resultado.insertId });
  });
});

// Editar producto
app.put('/api/admin/productos/:id', verificarToken, (req, res) => {
  const { nombre, marca, descripcion, precio, stock, imagen_url, categoria_id, activo } = req.body;
  const sql = 'UPDATE productos SET nombre=?, marca=?, descripcion=?, precio=?, stock=?, imagen_url=?, categoria_id=?, activo=? WHERE id=?';
  db.query(sql, [nombre, marca, descripcion, precio, stock, imagen_url, categoria_id, activo, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Producto actualizado' });
  });
});

// Eliminar producto
app.delete('/api/admin/productos/:id', verificarToken, (req, res) => {
  db.query('DELETE FROM productos WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Producto eliminado' });
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});