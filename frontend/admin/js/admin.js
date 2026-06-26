const API = 'http://localhost:3000/api';

// =============================================
// LOGIN
// =============================================
async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      document.getElementById('error-msg').style.display = 'block';
      document.getElementById('error-msg').textContent = data.error;
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('nombre', data.nombre);
    window.location.href = 'dashboard.html';

  } catch (err) {
    console.error(err);
  }
}

// =============================================
// DASHBOARD
// =============================================
let productoEditandoId = null;
let categorias = [];

async function cargarProductos() {
  const token = localStorage.getItem('token');
  if (!token) { window.location.href = 'login.html'; return; }

  const res = await fetch(`${API}/admin/productos`, {
    headers: { 'authorization': token }
  });

  if (res.status === 401) { window.location.href = 'login.html'; return; }

  const productos = await res.json();
  const tbody = document.getElementById('tabla-body');

  if (productos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8">No hay productos</td></tr>';
    return;
  }

  tbody.innerHTML = productos.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td>${p.marca || '-'}</td>
      <td>${p.categoria_nombre}</td>
      <td>$${Number(p.precio).toLocaleString('es-CO')}</td>
      <td>${p.stock}</td>
      <td><span class="${p.activo ? 'badge-activo' : 'badge-inactivo'}">${p.activo ? 'Sí' : 'No'}</span></td>
      <td>
        <button class="btn-editar" onclick="abrirModalEditar(${p.id})">Editar</button>
        <button class="btn-eliminar" onclick="eliminarProducto(${p.id})">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

async function cargarCategorias() {
  const res = await fetch(`${API}/categorias`);
  categorias = await res.json();

  const select = document.getElementById('p-categoria');
  if (!select) return;

  select.innerHTML = categorias.map(c => `
    <option value="${c.id}">${c.nombre}</option>
  `).join('');
}

// =============================================
// MODAL
// =============================================
function abrirModalAgregar() {
  productoEditandoId = null;
  document.getElementById('modal-titulo').textContent = 'Agregar producto';
  document.getElementById('p-nombre').value = '';
  document.getElementById('p-marca').value = '';
  document.getElementById('p-descripcion').value = '';
  document.getElementById('p-precio').value = '';
  document.getElementById('p-stock').value = '';
  document.getElementById('p-imagen').value = '';
  document.getElementById('modal').style.display = 'flex';
}

async function abrirModalEditar(id) {
  productoEditandoId = id;
  document.getElementById('modal-titulo').textContent = 'Editar producto';

  const token = localStorage.getItem('token');
  const res = await fetch(`${API}/productos/${id}`, {
    headers: { 'authorization': token }
  });
  const p = await res.json();

  document.getElementById('p-nombre').value = p.nombre;
  document.getElementById('p-marca').value = p.marca || '';
  document.getElementById('p-descripcion').value = p.descripcion || '';
  document.getElementById('p-precio').value = p.precio;
  document.getElementById('p-stock').value = p.stock;
  document.getElementById('p-imagen').value = p.imagen_url || '';
  document.getElementById('p-categoria').value = p.categoria_id;
  document.getElementById('modal').style.display = 'flex';
}

function cerrarModal() {
  document.getElementById('modal').style.display = 'none';
}

async function guardarProducto() {
  const token = localStorage.getItem('token');
  const body = {
    nombre: document.getElementById('p-nombre').value,
    marca: document.getElementById('p-marca').value,
    descripcion: document.getElementById('p-descripcion').value,
    precio: document.getElementById('p-precio').value,
    stock: document.getElementById('p-stock').value,
    imagen_url: document.getElementById('p-imagen').value,
    categoria_id: document.getElementById('p-categoria').value,
    activo: true
  };

  const url = productoEditandoId
    ? `${API}/admin/productos/${productoEditandoId}`
    : `${API}/admin/productos`;

  const method = productoEditandoId ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'authorization': token
    },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    cerrarModal();
    cargarProductos();
  }
}

async function eliminarProducto(id) {
  if (!confirm('¿Seguro que quieres eliminar este producto?')) return;

  const token = localStorage.getItem('token');
  const res = await fetch(`${API}/admin/productos/${id}`, {
    method: 'DELETE',
    headers: { 'authorization': token }
  });

  if (res.ok) cargarProductos();
}

function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('nombre');
  window.location.href = 'login.html';
}

// =============================================
// INICIALIZAR
// =============================================
if (document.getElementById('tabla-body')) {
  cargarProductos();
  cargarCategorias();
}