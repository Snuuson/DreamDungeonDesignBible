const themeToggle = document.querySelector('.theme-toggle');
let storedTheme = null;
try { storedTheme = localStorage.getItem('dream-dungeon-theme'); } catch { /* File previews can disable storage. */ }

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
  try { localStorage.setItem('dream-dungeon-theme', nextTheme); } catch { /* Theme still works for this visit. */ }
  updateThemeButton();
});

updateThemeButton();

document.getElementById('menu-toggle').addEventListener('click', (event) => {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('is-open');
  event.currentTarget.setAttribute('aria-expanded', String(sidebar.classList.contains('is-open')));
});
