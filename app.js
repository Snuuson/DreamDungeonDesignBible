const themeToggle = document.querySelector('.theme-toggle');
const storedTheme = localStorage.getItem('dream-dungeon-theme');

if (storedTheme) document.documentElement.dataset.theme = storedTheme;

function isDarkTheme() {
  return document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function updateThemeButton() {
  const dark = isDarkTheme();
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.querySelector('.theme-label').textContent = dark ? 'Light' : 'Dark';
  themeToggle.querySelector('[aria-hidden="true"]').textContent = dark ? '☀' : '☾';
}

themeToggle.addEventListener('click', () => {
  const nextTheme = isDarkTheme() ? 'light' : 'dark';
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem('dream-dungeon-theme', nextTheme);
  updateThemeButton();
});

updateThemeButton();

document.getElementById('menu-toggle').addEventListener('click', (event) => {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('is-open');
  event.currentTarget.setAttribute('aria-expanded', String(sidebar.classList.contains('is-open')));
});
