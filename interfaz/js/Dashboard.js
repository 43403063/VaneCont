// Verificar si el usuario está logueado
const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

if (!loggedInUser) {
  // Si no existe un usuario en localStorage, se redirige al login
  window.location.href = 'login.html';
} else {
  // Si hay un usuario logueado, mostrar saludo
  const greeting = document.getElementById('greeting');
  greeting.innerHTML = `<h2>¡Bienvenido, ${loggedInUser.nombre}!</h2>`;
}

// Cerrar sesión
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.addEventListener('click', (e) => {
  e.preventDefault();
  // Eliminar el usuario logueado del localStorage
  eliminarDatos('loggedInUser');
  // Redirigir a la página de login
  window.location.href = 'Login.html';
});

//menu Toggle
const menuToggle = document.getElementById('menuToggle');
const sidebarNav = document.getElementById('sidebarNav');

menuToggle.addEventListener('click', () => {
  sidebarNav.classList.toggle('open'); // Clase que controlará la visibilidad del menú
});


// Verifica si hay una preferencia guardada en localStorage y aplica el modo dark
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
}

const darkModeToggle = document.getElementById('darkModeToggle');

darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');

  // Guarda la preferencia en localStorage
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});
