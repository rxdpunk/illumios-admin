import DOCS from '../data/docs-manifest.js';

const ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`;

const GROUP_LABELS = {
  root: 'Core Repo Docs',
  planning: 'Planning',
  outputs: 'Outputs',
};

function groupDocs(items) {
  return items.reduce((acc, item) => {
    const key = item.group || 'other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

function renderDocCard(doc) {
  return `
    <article class="doc-card">
      <div class="doc-title">${doc.title}</div>
      <div class="doc-meta">
        <span class="doc-badge">${doc.type.toUpperCase()}</span>
        <span class="doc-path">${doc.path}</span>
      </div>
      <div class="doc-actions">
        <a class="doc-link" href="${doc.href}" target="_blank" rel="noopener noreferrer">Open</a>
        <a class="doc-link doc-link-muted" href="${doc.href}" download>Download</a>
      </div>
    </article>
  `;
}

export default {
  id: 'docs',
  title: 'Docs',
  icon: ICON,
  showInSidebar: true,

  async mount(el) {
    const grouped = groupDocs(DOCS);
    const totalMd = DOCS.filter((doc) => doc.type === 'md').length;
    const totalPdf = DOCS.filter((doc) => doc.type === 'pdf').length;

    el.innerHTML = `
      <div class="docs-shell">
        <div class="docs-hero card">
          <div class="card-title">Documentation Library</div>
          <h2 class="docs-heading">All Illumios Markdown and PDF docs</h2>
          <p class="docs-subtitle">These files are synced into the admin app from the main \`illumios\` repo so they can be opened directly from Mission Control.</p>
          <div class="docs-summary">
            <div class="docs-stat"><strong>${DOCS.length}</strong><span>Total docs</span></div>
            <div class="docs-stat"><strong>${totalMd}</strong><span>Markdown files</span></div>
            <div class="docs-stat"><strong>${totalPdf}</strong><span>PDF files</span></div>
          </div>
        </div>
        ${Object.entries(grouped).map(([group, items]) => `
          <section class="docs-group">
            <div class="docs-group-header">
              <h3>${GROUP_LABELS[group] || group}</h3>
              <span>${items.length} file${items.length === 1 ? '' : 's'}</span>
            </div>
            <div class="docs-grid">
              ${items.map(renderDocCard).join('')}
            </div>
          </section>
        `).join('')}
      </div>
    `;
  },
};
