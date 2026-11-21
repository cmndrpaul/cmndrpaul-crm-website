const views = {
  dashboard: ['Dashboard', 'See upcoming deadlines, recent website projects, and GitHub activity in one view.'],
  projects: ['Projects', 'Browse website projects by status, with thumbnails and links back to each site.'],
  tasks: ['Tasks', 'Track tasks and subtasks in a list or move work through a Kanban board.'],
  local: ['Local Projects', 'Keep Windows folder paths handy and copy PowerShell or CMD commands.'],
  github: ['GitHub', 'Browse public repositories, pull requests, and commits from the linked account.'],
};

const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const preferredTheme = matchMedia('(prefers-color-scheme: dark)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const tabs = [...document.querySelectorAll('[role="tab"]')];
const preview = document.querySelector('#preview');
const description = document.querySelector('#preview-description');
const display = document.querySelector('#workspace-shot');
const laptop = document.querySelector('.laptop');
const lightbox = document.querySelector('.lightbox');
const largeShot = document.querySelector('#large-shot');
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
  laptop.setAttribute('aria-label', 'Enlarge ' + title + ' preview');
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
    const target = {
      ArrowLeft: index - 1, ArrowUp: index - 1, ArrowRight: index + 1, ArrowDown: index + 1,
      Home: 0, End: tabs.length - 1,
    }[event.key];
    if (typeof target !== 'number') return;
    event.preventDefault();
    const next = tabs[(target + tabs.length) % tabs.length];
    selectTab(next);
    next.focus();
  });
}

function enlarge() {
  document.querySelector('#lightbox-title').textContent = views[active][0];
  largeShot.src = './assets/' + active + (root.dataset.theme === 'dark' ? '-light.webp' : '-dark.webp');
  largeShot.alt = 'cmndrCRM ' + views[active][0] + ' with sample data';
  lightbox.showModal();
}
laptop.addEventListener('click', enlarge);
document.querySelector('#enlarge').addEventListener('click', enlarge);
lightbox.querySelector('button').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });

themeToggle.addEventListener('click', () => {
  choice = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('cmndrcrm.showcase.theme', choice); } catch { /* The theme works for this visit. */ }
  applyTheme(choice);
});
const systemTheme = () => preferredTheme.matches ? 'dark' : 'light';
preferredTheme.addEventListener('change', () => { if (!choice) applyTheme(systemTheme()); });
applyTheme(choice === 'light' || choice === 'dark' ? choice : systemTheme());
