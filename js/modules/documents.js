import { playSound } from './sounds.js';
import { t, tData, onLangChange } from './i18n.js';

const overlay = document.getElementById('document-overlay');
const modal = document.getElementById('document-modal');
const header = document.getElementById('doc-header');
const pagesEl = document.getElementById('doc-pages');
const pageInfo = document.getElementById('doc-page-info');
const prevBtn = document.getElementById('doc-prev');
const nextBtn = document.getElementById('doc-next');
const closeBtn = document.getElementById('doc-close');

let currentFolder = null;
let currentPage = 0;

export function initDocuments() {
  closeBtn.addEventListener('pointerup', closeDocument);
  overlay.addEventListener('pointerup', (e) => {
    if (e.target === overlay) closeDocument();
  });
  prevBtn.addEventListener('pointerup', () => flipPage(-1));
  nextBtn.addEventListener('pointerup', () => flipPage(1));

  document.addEventListener('keydown', (e) => {
    if (overlay.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeDocument();
    if (e.key === 'ArrowLeft') flipPage(-1);
    if (e.key === 'ArrowRight') flipPage(1);
  });

  // Re-render current document on language change
  onLangChange(() => {
    if (currentFolder && !overlay.classList.contains('hidden')) {
      renderPage();
    }
  });
}

export function openDocument(folder) {
  currentFolder = folder;
  currentPage = 0;

  header.innerHTML = `
    <h2>${tData(folder.pages[0].heading, folder.pages[0].heading_en)}</h2>
    <span class="doc-stamp">${t('doc.stamp.high')}</span>
  `;

  renderPage();
  overlay.classList.remove('hidden');
  playSound('folder-open');
}

function closeDocument() {
  overlay.classList.add('hidden');
  currentFolder = null;
  playSound('folder-close');
}

function flipPage(direction) {
  const newPage = currentPage + direction;
  if (!currentFolder || newPage < 0 || newPage >= currentFolder.pages.length) return;
  currentPage = newPage;
  playSound('page-flip');
  renderPage();
}

function renderPage() {
  if (!currentFolder) return;
  const page = currentFolder.pages[currentPage];

  header.innerHTML = `
    <h2>${tData(page.heading, page.heading_en)}</h2>
    <span class="doc-stamp">${currentFolder.id === 'secret' ? t('doc.stamp.classified') : t('doc.stamp.high')}</span>
  `;

  let html = '';
  switch (page.type) {
    case 'profile': html = renderProfile(page); break;
    case 'timeline': html = renderTimeline(page); break;
    case 'cards': html = renderCards(page); break;
    case 'grid': html = renderGrid(page); break;
    case 'links': html = renderLinks(page); break;
    case 'secret': html = renderSecret(page); break;
    default: html = `<p>${t('doc.unknown')}</p>`;
  }

  pagesEl.innerHTML = `<div class="doc-page type-${page.type}">${html}</div>`;

  // Update nav
  const total = currentFolder.pages.length;
  pageInfo.textContent = `${t('doc.page')} ${currentPage + 1} / ${total}`;
  prevBtn.disabled = currentPage === 0;
  nextBtn.disabled = currentPage >= total - 1;

  // Hide nav if single page
  document.getElementById('doc-nav').style.display = total <= 1 ? 'none' : 'flex';
}

function renderProfile(page) {
  const c = page.content;
  let html = `
    <div class="profile-header">
      <div class="profile-name">${c.name}</div>
      <div class="profile-title">${tData(c.title, c.title_en)}</div>
    </div>
    <h3 class="section-title">${t('doc.section.profile')}</h3>
    <p class="about-text">${tData(c.about, c.about_en)}</p>
  `;

  if (c.languages) {
    html += `<h3 class="section-title">${t('doc.section.languages')}</h3><ul class="lang-list">`;
    c.languages.forEach(l => {
      html += `<li>${l.lang} — ${l.level}</li>`;
    });
    html += `</ul>`;
  }

  if (c.hobbies) {
    const hobbies = tData(c.hobbies, c.hobbies_en);
    html += `<h3 class="section-title">${t('doc.section.activities')}</h3><ul class="hobby-list">`;
    hobbies.forEach(h => {
      html += `<li>${h}</li>`;
    });
    html += `</ul>`;
  }

  return html;
}

function renderTimeline(page) {
  let html = '';
  page.items.forEach(item => {
    html += `
      <div class="timeline-item">
        <div class="tl-title">${tData(item.title, item.title_en)}</div>
        <div class="tl-org">${tData(item.org, item.org_en)}</div>
        <div class="tl-date">${tData(item.date, item.date_en)}</div>
        <ul class="tl-details">
          ${tData(item.details, item.details_en).map(d => `<li>${d}</li>`).join('')}
        </ul>
      </div>
    `;
  });
  return html;
}

function renderCards(page) {
  let html = '';
  page.items.forEach(item => {
    html += `
      <div class="project-card">
        <div class="pc-header">
          <span class="pc-title">${tData(item.title, item.title_en)}</span>
          <span class="pc-meta">${item.tech} · ${item.year}</span>
        </div>
        <p class="pc-desc">${tData(item.description, item.description_en)}</p>
      </div>
    `;
  });
  return html;
}

function renderGrid(page) {
  let html = '';
  page.categories.forEach(cat => {
    html += `
      <div class="skill-category">
        <div class="sc-name">${tData(cat.name, cat.name_en)}</div>
        <div class="skill-tags">
          ${cat.items.map(i => `<span class="skill-tag">${i}</span>`).join('')}
        </div>
      </div>
    `;
  });
  return html;
}

function renderLinks(page) {
  let html = `<div class="contact-section"><h3>${t('doc.section.contact')}</h3>`;

  if (page.contact.email) {
    html += `
      <div class="contact-item">
        <span class="ci-label">${t('doc.label.email')}</span>
        <a href="mailto:${page.contact.email}">${page.contact.email}</a>
      </div>`;
  }
  if (page.contact.phone) {
    html += `
      <div class="contact-item">
        <span class="ci-label">${t('doc.label.phone')}</span>
        <span>${page.contact.phone}</span>
      </div>`;
  }
  html += `</div>`;

  if (page.references) {
    html += `<div class="contact-section"><h3>${t('doc.section.references')}</h3>`;
    page.references.forEach(ref => {
      html += `
        <div class="contact-item">
          <span class="ci-label">${t('doc.label.name')}</span>
          <span>${ref.name}</span>
        </div>`;
      if (ref.title) {
        html += `
        <div class="contact-item">
          <span class="ci-label">${t('doc.label.title')}</span>
          <span>${ref.title}</span>
        </div>`;
      }
      html += `
        <hr style="border:none;border-top:1px dashed rgba(58,48,32,0.2);margin:10px 0;">`;
    });
    html += `</div>`;
  }

  return html;
}

function renderSecret(page) {
  const c = page.content;
  let html = `<div class="secret-warning">${t('doc.secret.warning')}</div>`;

  const facts = tData(c.funFacts, c.funFacts_en);
  facts.forEach(fact => {
    html += `<div class="fun-fact">${fact}</div>`;
  });

  if (c.motto) {
    html += `<div class="secret-motto">"${tData(c.motto, c.motto_en)}"</div>`;
  }

  return html;
}
