/// Para evitar que se oculte el dropdown al hacer click en los botones
const no_propagation = document.querySelectorAll('.no-propagation');

no_propagation.forEach(element => {
  element.addEventListener('click', event => event.stopPropagation());
});

/// Toggle Navbar modo color
const body = document.querySelector('body');
const darkDropdown = document.querySelector('[data-bs-theme="dark"]');
const buttonToggle = document.querySelector('#toggleMode');
const toggleIcon = document.querySelector('.bi-toggle-off');
const eyeIcon = document.querySelector('.bi-eye');
let isDarkMode = true;

const cambiarModo = () => {
  isDarkMode = !isDarkMode;

  // Cambia el valor de la variable dark-mode en localStorage
  localStorage.setItem('dark-mode', isDarkMode + '');

  // Cambia la clase para cambiar el tema del body
  body.classList.toggle('dark-mode');
  body.classList.toggle('light-mode');

  // Pregunta si el body tiene la clase dark-mode para cambiar el tema del navbar
  let theme = body.classList.contains('dark-mode') ? 'dark' : 'light';
  darkDropdown.setAttribute('data-bs-theme', theme);

  // Pregunta si el body tiene la clase dark-mode para cambiar el texto del dropdown
  buttonToggle.textContent = body.classList.contains('dark-mode')
    ? 'Light Mode'
    : 'Dark Mode';

  // Cambia los iconos de los botones (toggle y eye)
  toggleIcon.classList.toggle('bi-toggle-off');
  toggleIcon.classList.toggle('bi-toggle-on');

  eyeIcon.classList.toggle('bi-eye-fill');
  eyeIcon.classList.toggle('bi-eye');
};

// Este archivo se carga en todas las páginas, por eso el ?
buttonToggle?.addEventListener('click', cambiarModo);

(() => {
  // Obtiene el valor de la variable dark-mode en localStorage
  const darkMode = localStorage.getItem('dark-mode') === 'true';

  if (!darkMode) cambiarModo();
})();

// Hace que los checkboxes sean persistentes
const checkboxes = document.querySelectorAll('.form-check-input');
const genres = JSON.parse(localStorage.getItem('genres')) || [];

checkboxes.forEach(checkbox => {
  checkbox.checked = genres.includes(checkbox.id);
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      genres.push(checkbox.id);
    } else {
      genres.splice(genres.indexOf(checkbox.id), 1);
    }

    localStorage.setItem('genres', JSON.stringify(genres));
  });
});
