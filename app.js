document.getElementById('menu-toggle').addEventListener('click', (event) => {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('is-open');
  event.currentTarget.setAttribute('aria-expanded', String(sidebar.classList.contains('is-open')));
});
