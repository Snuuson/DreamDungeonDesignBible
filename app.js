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

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') { cell += '"'; index += 1; }
      else { quoted = !quoted; }
    } else if (character === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      cell = '';
    } else { cell += character; }
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }

  const [headers, ...data] = rows;
  return data.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

const spellTableBody = document.getElementById('spell-table-body');
if (spellTableBody) {
  const spellCount = document.getElementById('spell-count');
  const spellFilter = document.getElementById('spell-filter');
  fetch('Spell_Ideas_Latest%20-%20Spells.csv')
    .then((response) => {
      if (!response.ok) throw new Error('Spell source unavailable');
      return response.text();
    })
    .then((text) => {
      const spells = parseCsv(text);
      const render = () => {
        const query = spellFilter.value.trim().toLowerCase();
        const visible = spells.filter((spell) => Object.values(spell).join(' ').toLowerCase().includes(query));
        spellTableBody.innerHTML = visible.map((spell) => `<tr><td class="spell-name">${escapeHtml(spell.Name)}</td><td>${escapeHtml(spell.Color)}</td><td>${escapeHtml(spell.Effect)}</td><td>${escapeHtml(spell.Range)}</td><td>${escapeHtml(spell.Requirements)}</td><td>${escapeHtml(spell.Cast)}</td></tr>`).join('');
        spellCount.textContent = query ? `${visible.length} of ${spells.length} spells` : `${spells.length} spells`;
      };
      spellFilter.addEventListener('input', render);
      render();
    })
    .catch(() => {
      spellCount.textContent = 'Unable to load the spell index.';
      spellTableBody.innerHTML = '<tr><td colspan="6">Open this site through GitHub Pages or a local web server to display the spell index.</td></tr>';
    });
}
