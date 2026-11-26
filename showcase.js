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
const screenshotPath = './assets/walkthrough-v1/';
let active = 'dashboard';
let request = 0;
let preloadRun = 0;
let choice;

try { choice = localStorage.getItem('cmndrcrm.showcase.theme'); } catch { /* The page still follows the system theme. */ }

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  const run = ++preloadRun;
  const suffix = theme === 'dark' ? '-light.webp' : '-dark.webp';
  void renderPreview().then(async () => {
    await display.decode();
    for (const view of Object.keys(views)) {
      if (run !== preloadRun) return;
      const source = screenshotPath + view + suffix;
      if (display.getAttribute('src') === source) continue;
      const image = new Image();
      image.fetchPriority = 'low';
      image.src = source;
      await image.decode().catch(() => {});
    }
  }).catch(() => {});
}

async function renderPreview() {
  const [title, caption] = views[active];
  const source = screenshotPath + active + (root.dataset.theme === 'dark' ? '-light.webp' : '-dark.webp');
  const alt = 'cmndrCRM ' + title + ' with sample data';
  description.textContent = caption;
  const current = ++request;
  if (display.getAttribute('src') === source) return;
  const image = new Image();
  image.src = source;
  try {
    await image.decode();
    if (request !== current) return;
    display.src = source;
    display.alt = alt;
    if (!reducedMotion.matches) display.animate([{ opacity: .48 }, { opacity: 1 }], { duration: 230, easing: 'ease-out' });
  } catch {
    if (request !== current) return;
    description.textContent = 'This preview could not load. Choose another view or reload the page.';
  }
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

function scrollToSection(section, behavior = 'auto') {
  const target = document.getElementById(section);
  if (target) target.scrollIntoView({ behavior });
  else window.scrollTo({ top: 0, behavior });
}

const localFile = location.protocol === 'file:';
for (const link of document.querySelectorAll('[data-section]')) {
  link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (!localFile && location.href !== link.href) history.pushState(null, '', link.href);
    scrollToSection(link.dataset.section);
  });
}
document.querySelector('.skip').addEventListener('click', event => {
  event.preventDefault();
  const main = document.querySelector('#main');
  main.focus({ preventScroll: true });
  main.scrollIntoView();
});
if (!localFile) {
  const sectionFromPath = () => location.pathname.split('/').filter(Boolean).at(-1) ?? '';
  history.scrollRestoration = 'manual';
  window.addEventListener('popstate', () => scrollToSection(sectionFromPath(), 'instant'));
  if (['walkthrough', 'about'].includes(sectionFromPath())) {
    requestAnimationFrame(() => scrollToSection(sectionFromPath(), 'instant'));
  }
}
