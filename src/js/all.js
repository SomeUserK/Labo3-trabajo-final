const no_propagation = document.querySelectorAll('.no-propagation');

// Para evitar que se oculte el dropdown al hacer click en los botones
no_propagation.forEach(element => {
  element.addEventListener('click', event => event.stopPropagation());
});
