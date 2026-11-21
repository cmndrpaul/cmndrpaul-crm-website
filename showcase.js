const views = {
  dashboard: ['Dashboard', 'See upcoming deadlines, recent website projects, and GitHub activity in one view.'],
  projects: ['Projects', 'Browse website projects by status, with thumbnails and links back to each site.'],
  tasks: ['Tasks', 'Track tasks and subtasks in a list or move work through a Kanban board.'],
  local: ['Local Projects', 'Keep Windows folder paths handy and copy PowerShell or CMD commands.'],
  github: ['Repositories', 'Browse public repository cards with languages, commit activity charts, open pull requests, and details.'],
  pulls: ['Pull Requests', 'Choose a public repository and filter its pull requests by status.'],
  commits: ['Commits', 'Browse recent commits with their messages, authors, dates, and short hashes.'],
};

const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const preferredTheme = matchMedia('(prefers-color-scheme: dark)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const tabs = [...document.querySelectorAll('[role="tab"]')];
const preview = document.querySelector('#preview');
const description = document.querySelector('#preview-description');
const display = document.querySelector('#workspace-shot');
let active = 'dashboard';
let request = 0;
let choice;

try { choice = localStorage.getItem('cmndrcrm.showcase.theme'); } catch { /* The page still follows the system theme. */ }

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  renderPreview();
}

function renderPreview() {
  const [title, caption] = views[active];
  const source = './assets/' + active + (root.dataset.theme === 'dark' ? '-light.webp' : '-dark.webp');
  const alt = 'cmndrCRM ' + title + ' with sample data';
  description.textContent = caption;
  const current = ++request;
  if (display.getAttribute('src') === source) return;
  const image = new Image();
  image.src = source;
  image.decode().then(() => {
    if (request !== current) return;
    display.src = source;
    display.alt = alt;
    if (!reducedMotion.matches) display.animate([{ opacity: .48 }, { opacity: 1 }], { duration: 230, easing: 'ease-out' });
  }).catch(() => {
    if (request !== current) return;
    description.textContent = 'This preview could not load. Choose another view or reload the page.';
  });
}

function selectTab(tab) {
  active = tab.dataset.view;
  for (const candidate of tabs) {
    candidate.setAttribute('aria-selected', String(candidate === tab));
    candidate.tabIndex = candidate === tab ? 0 : -1;
  }
  preview.setAttribute('aria-labelledby', tab.id);
  renderPreview();
}

for (const [index, tab] of tabs.entries()) {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    const columns = matchMedia('(max-width: 850px)').matches ? 2 : 1;
    const target = {
      ArrowLeft: index - 1, ArrowUp: index - columns, ArrowRight: index + 1, ArrowDown: index + columns,
      Home: 0, End: tabs.length - 1,
    }[event.key];
    if (typeof target !== 'number') return;
    event.preventDefault();
    const next = tabs[(target + tabs.length) % tabs.length];
    selectTab(next);
    next.focus();
  });
}

themeToggle.addEventListener('click', () => {
  choice = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('cmndrcrm.showcase.theme', choice); } catch { /* The theme works for this visit. */ }
  applyTheme(choice);
});
const systemTheme = () => preferredTheme.matches ? 'dark' : 'light';
preferredTheme.addEventListener('change', () => { if (!choice) applyTheme(systemTheme()); });
applyTheme(choice === 'light' || choice === 'dark' ? choice : systemTheme());
