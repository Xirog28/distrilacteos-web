
// Filtro de categorías
const botones = document.querySelectorAll('.filtro-btn');
const tarjetas = document.querySelectorAll('.producto-card');

botones.forEach(boton => {
  boton.addEventListener('click', () => {

    botones.forEach(b => b.classList.remove('activo'));
    boton.classList.add('activo');

    const categoria = boton.dataset.categoria;

    tarjetas.forEach(tarjeta => {
      if (categoria === 'todos' || tarjeta.dataset.categoria === categoria) {
        tarjeta.style.display = 'block';
      } else {
        tarjeta.style.display = 'none';
      }
    });

  });
});