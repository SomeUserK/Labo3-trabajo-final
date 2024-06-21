//Toggle Navbar
let buttonToggle = document.querySelector('#toggleMode');
let body = document.querySelector('body');
const darkDropdown = document.querySelector('[data-bs-theme="dark"]');
const toggleIcon= document.querySelector('.bi-toggle-off');
const eyeIcon = document.querySelector('.bi-eye');


buttonToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    body.classList.toggle('light-mode');

    let theme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    darkDropdown.setAttribute('data-bs-theme', theme);
    
    toggleIcon.classList.toggle('bi-toggle-off');
    toggleIcon.classList.toggle('bi-toggle-on');

    eyeIcon.classList.toggle('bi-eye-fill');
    eyeIcon.classList.toggle('bi-eye');
});