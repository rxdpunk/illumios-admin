import DOCS from '../data/docs-manifest.js';
import DOC_VAULT from '../data/docs-vault.js';
import { storage } from '../core/storage.js';

const ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`;

const GROUP_LABELS = {
  all: 'All Areas',
  root: 'Core Repo Docs',
  planning: 'Planning',
  outputs: 'Outputs',
};

const TYPE_LABELS = {
  all: 'All Types',
  md: 'Markdown',
  pdf: 'PDF',
};

const DEFAULT_PINNED_PATHS = [
  'planning/illumios-operating-directives.md',
  'planning/illumios-academia-prd.md',
  'planning/illumios-academia-offer-package.pdf',
  'planning/illumios-academia-curriculum.pdf',
];

const PINNED_KEY = 'docs/pinned';
const RECENT_KEY = 'docs/recent';
const MAX_RECENT = 8;
const MAX_SPOTLIGHT = 6;
const MAX_WIDGET_ITEMS = 4;

const DOCS_BY_PATH = new Map(
  DOCS.map((doc) => {
    const searchText = [
      doc.title,
      doc.path,
      doc.group,
      doc.type,
    ].join(' ').toLowerCase();
    return [doc.path, { ...doc, searchText }];
  }),
);

const DOCS_SORTED_BY_ADDED = [...DOCS_BY_PATH.values()].sort((a, b) => {
  return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
});

function esc(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function unique(items) {
  return [...new Set(items)];
}

function compactPaths(paths) {
  return unique((paths || []).filter((path) => DOCS_BY_PATH.has(path)));
}

function docsFromPaths(paths) {
  return compactPaths(paths).map((path) => DOCS_BY_PATH.get(path)).filter(Boolean);
}

function formatDate(value) {
  if (!value) return 'Unknown update';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Unknown update';
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return 'File size unavailable';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function groupDocs(items) {
  return items.reduce((acc, item) => {
    const key = item.group || 'other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

function matchesFilters(doc, query, group, type) {
  if (group !== 'all' && doc.group !== group) return false;
  if (type !== 'all' && doc.type !== type) return false;
  if (!query) return true;
  return doc.searchText.includes(query.trim().toLowerCase());
}

function renderFilterRow(kind, active, options) {
  return `
    <div class="docs-filter-row">
      <span class="docs-filter-label">${kind === 'group' ? 'Area' : 'Type'}</span>
      <div class="docs-filter-pills">
        ${options.map(([value, label]) => `
          <button
            type="button"
            class="docs-filter-chip ${active === value ? 'is-active' : ''}"
            data-filter-kind="${kind}"
            data-filter-value="${value}"
          >${label}</button>
        `).join('')}
      </div>
    </div>
  `;
}

function renderDocCard(doc, pinnedSet, layout = 'full') {
  const isPinned = pinnedSet.has(doc.path);
  const compact = layout === 'compact';
  return `
    <article class="doc-card ${compact ? 'doc-card-compact' : ''}">
      <div class="doc-card-top">
        <div class="doc-meta-cluster">
          <span class="doc-badge">${esc(doc.type.toUpperCase())}</span>
          <span class="doc-group-tag">${esc(GROUP_LABELS[doc.group] || doc.group)}</span>
        </div>
        <button
          type="button"
          class="doc-pin-btn ${isPinned ? 'is-pinned' : ''}"
          data-doc-pin="${esc(doc.path)}"
          aria-label="${isPinned ? 'Unpin document' : 'Pin document'}"
          title="${isPinned ? 'Unpin document' : 'Pin document'}"
        >★</button>
      </div>
      <div class="doc-title">${esc(doc.title)}</div>
      <div class="doc-path">${esc(doc.path)}</div>
      <div class="doc-card-foot">
        <div class="doc-updated">Updated ${esc(formatDate(doc.updatedAt))}</div>
        <div class="doc-size">${esc(formatSize(doc.bytes))}</div>
      </div>
      <div class="doc-actions">
        <button
          type="button"
          class="doc-link"
          data-doc-open="${esc(doc.path)}"
          data-doc-action="open"
        >Open</button>
        <button
          type="button"
          class="doc-link doc-link-muted"
          data-doc-open="${esc(doc.path)}"
          data-doc-action="download"
        >Download</button>
      </div>
    </article>
  `;
}

function renderSpotlightSection(title, subtitle, items, pinnedSet) {
  if (!items.length) return '';
  return `
    <section class="docs-spotlight card">
      <div class="docs-spotlight-head">
        <div>
          <div class="card-title">${esc(title)}</div>
          <p class="docs-spotlight-copy">${esc(subtitle)}</p>
        </div>
        <span class="docs-spotlight-count">${items.length} doc${items.length === 1 ? '' : 's'}</span>
      </div>
      <div class="docs-grid docs-grid-spotlight">
        ${items.map((doc) => renderDocCard(doc, pinnedSet, 'compact')).join('')}
      </div>
    </section>
  `;
}

async function loadPinnedPaths() {
  const stored = compactPaths(await storage.get(PINNED_KEY, null));
  if (stored.length) return stored;
  const seeded = compactPaths(DEFAULT_PINNED_PATHS);
  await storage.set(PINNED_KEY, seeded);
  return seeded;
}

async function savePinnedPaths(paths) {
  await storage.set(PINNED_KEY, compactPaths(paths));
}

async function loadRecentPaths() {
  return compactPaths(await storage.get(RECENT_KEY, []));
}

async function trackRecentPath(path) {
  if (!DOCS_BY_PATH.has(path)) return;
  const current = await loadRecentPaths();
  const updated = [path, ...current.filter((entry) => entry !== path)].slice(0, MAX_RECENT);
  await storage.set(RECENT_KEY, updated);
}

async function togglePinnedPath(path) {
  const current = await loadPinnedPaths();
  const next = current.includes(path)
    ? current.filter((entry) => entry !== path)
    : [path, ...current.filter((entry) => entry !== path)];
  await savePinnedPaths(next);
  return next;
}

function renderMiniDocList(items) {
  return items.map((doc) => `
    <button
      type="button"
      class="mini-doc-item"
      data-doc-open="${esc(doc.path)}"
      data-doc-action="open"
    >
      <span class="mini-doc-type">${esc(doc.type.toUpperCase())}</span>
      <span class="mini-doc-copy">
        <strong>${esc(doc.title)}</strong>
        <span>${esc(formatDate(doc.updatedAt))}</span>
      </span>
    </button>
  `).join('');
}

function blobFromDoc(path) {
  const payload = DOC_VAULT[path];
  if (!payload) throw new Error(`Doc payload missing for ${path}`);
  const binary = atob(payload.base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: payload.mimeType || 'application/octet-stream' });
}

function filenameForPath(path) {
  return path.split('/').pop() || 'document';
}

function triggerDownload(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function handleDocAction(path, action) {
  const blob = blobFromDoc(path);
  const url = URL.createObjectURL(blob);
  const filename = filenameForPath(path);

  if (action === 'download') {
    triggerDownload(url, filename);
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  await trackRecentPath(path);
}

async function renderWidgetState(el) {
  const pinned = await loadPinnedPaths();
  const recent = await loadRecentPaths();
  const spotlight = docsFromPaths([...pinned, ...recent]).slice(0, MAX_WIDGET_ITEMS);
  const fallback = DOCS_SORTED_BY_ADDED.slice(0, MAX_WIDGET_ITEMS);
  const items = spotlight.length ? spotlight : fallback;

  el.innerHTML = `
    <div class="mini-docs-widget">
      <div class="card-title">Pinned + Recent</div>
      <div class="mini-docs-list">
        ${renderMiniDocList(items)}
      </div>
      <a class="link-btn mini-docs-link" href="#/docs">Open Docs Library →</a>
    </div>
  `;

  el.querySelectorAll('[data-doc-open]').forEach((link) => {
    link.addEventListener('click', async () => {
      await handleDocAction(link.dataset.docOpen, link.dataset.docAction || 'open');
    });
  });
}

function bindDocsInteractions(root, state, rerender) {
  root.querySelector('#docs-search-input')?.addEventListener('input', (event) => {
    state.query = event.target.value;
    rerender();
  });

  root.querySelector('#docs-clear-search')?.addEventListener('click', () => {
    state.query = '';
    rerender();
  });

  root.querySelectorAll('[data-filter-kind]').forEach((button) => {
    button.addEventListener('click', () => {
      const kind = button.dataset.filterKind;
      const value = button.dataset.filterValue;
      if (kind === 'group') state.group = value;
      if (kind === 'type') state.type = value;
      rerender();
    });
  });

  root.querySelectorAll('[data-doc-pin]').forEach((button) => {
    button.addEventListener('click', async () => {
      state.pinned = await togglePinnedPath(button.dataset.docPin);
      rerender();
    });
  });

  root.querySelectorAll('[data-doc-open]').forEach((link) => {
    link.addEventListener('click', async () => {
      await handleDocAction(link.dataset.docOpen, link.dataset.docAction || 'open');
      rerender();
    });
  });
}

export default {
  id: 'docs',
  title: 'Docs',
  icon: ICON,
  showInSidebar: true,

  widgets: [{
    id: 'docs-widget',
    title: 'Docs Hotlist',
    defaultW: 4,
    defaultH: 5,
    minW: 3,
    minH: 4,
    async render(el) {
      await renderWidgetState(el);
    },
  }],

  async mount(el) {
    const state = {
      query: '',
      group: 'all',
      type: 'all',
      pinned: await loadPinnedPaths(),
      recent: await loadRecentPaths(),
    };

    const rerender = async () => {
      state.recent = await loadRecentPaths();
      const pinnedSet = new Set(state.pinned);
      const filtered = DOCS_SORTED_BY_ADDED.filter((doc) => (
        matchesFilters(doc, state.query, state.group, state.type)
      ));
      const grouped = groupDocs(filtered);
      const activeFilters = state.query || state.group !== 'all' || state.type !== 'all';
      const pinnedDocs = docsFromPaths(state.pinned).slice(0, MAX_SPOTLIGHT);
      const recentDocs = docsFromPaths(state.recent).slice(0, MAX_SPOTLIGHT);
      const recentAddedDocs = DOCS_SORTED_BY_ADDED.slice(0, MAX_SPOTLIGHT);

      el.innerHTML = `
        <div class="docs-shell">
          <section class="docs-hero card">
            <div class="docs-hero-grid">
              <div class="docs-hero-copy">
                <div class="card-title">Documentation Library</div>
                <h2 class="docs-heading">Your Illumios operating library, in one place</h2>
                <p class="docs-subtitle">Search fast, pin the docs you teach from, and keep the latest internal references inside Mission Control instead of hunting through folders.</p>
                <div class="docs-security-note">
                  <span class="docs-security-badge">Internal only</span>
                  <span>This admin domain is gated and marked to stay out of search results.</span>
                </div>
              </div>
              <div class="docs-summary">
                <div class="docs-stat"><strong>${DOCS.length}</strong><span>Total docs</span></div>
                <div class="docs-stat"><strong>${DOCS.filter((doc) => doc.type === 'md').length}</strong><span>Markdown</span></div>
                <div class="docs-stat"><strong>${DOCS.filter((doc) => doc.type === 'pdf').length}</strong><span>PDF</span></div>
                <div class="docs-stat"><strong>${filtered.length}</strong><span>Matching now</span></div>
              </div>
            </div>

            <div class="docs-toolbar">
              <label class="docs-search">
                <span class="docs-search-icon">⌕</span>
                <input
                  id="docs-search-input"
                  type="search"
                  value="${esc(state.query)}"
                  placeholder="Search docs by title, path, or type"
                  autocomplete="off"
                />
              </label>
              <button type="button" class="docs-clear-btn" id="docs-clear-search">Clear</button>
            </div>

            <div class="docs-filters">
              ${renderFilterRow('group', state.group, Object.entries(GROUP_LABELS))}
              ${renderFilterRow('type', state.type, Object.entries(TYPE_LABELS))}
            </div>
          </section>

          ${!activeFilters ? renderSpotlightSection('Pinned Docs', 'Keep your go-to teaching and operating docs at the top.', pinnedDocs, pinnedSet) : ''}
          ${!activeFilters ? renderSpotlightSection('Recently Opened', 'Jump back into the files you used most recently.', recentDocs, pinnedSet) : ''}
          ${!activeFilters ? renderSpotlightSection('Recently Added', 'New or freshly updated docs from the synced Illumios source.', recentAddedDocs, pinnedSet) : ''}

          <section class="docs-results card">
            <div class="docs-results-header">
              <div>
                <div class="card-title">Library</div>
                <h3 class="docs-results-title">${activeFilters ? 'Filtered results' : 'Full library'}</h3>
              </div>
              <span class="docs-results-count">${filtered.length} doc${filtered.length === 1 ? '' : 's'} shown</span>
            </div>

            ${filtered.length ? Object.entries(grouped).map(([group, items]) => `
              <section class="docs-group">
                <div class="docs-group-header">
                  <h4>${esc(GROUP_LABELS[group] || group)}</h4>
                  <span>${items.length} file${items.length === 1 ? '' : 's'}</span>
                </div>
                <div class="docs-grid">
                  ${items.map((doc) => renderDocCard(doc, pinnedSet)).join('')}
                </div>
              </section>
            `).join('') : `
              <div class="docs-empty-state">
                <div class="docs-empty-mark">No matches</div>
                <p>Try a broader keyword, switch the area filter, or clear the file type filter.</p>
              </div>
            `}
          </section>
        </div>
      `;

      bindDocsInteractions(el, state, rerender);
    };

    await rerender();
  },
};
