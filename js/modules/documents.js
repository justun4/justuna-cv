import { playSound } from './sounds.js';

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
  closeBtn.addEventListener('click', closeDocument);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDocument();
  });
  prevBtn.addEventListener('click', () => flipPage(-1));
  nextBtn.addEventListener('click', () => flipPage(1));

  document.addEventListener('keydown', (e) => {
    if (overlay.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeDocument();
    if (e.key === 'ArrowLeft') flipPage(-1);
    if (e.key === 'ArrowRight') flipPage(1);
  });
}

export function openDocument(folder) {
  currentFolder = folder;
  currentPage = 0;

  header.innerHTML = `
    <h2>${folder.pages[0].heading}</h2>
    <span class="doc-stamp">GİZLİLİK: YÜKSEK</span>
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
    <h2>${page.heading}</h2>
    <span class="doc-stamp">${currentFolder.id === 'secret' ? 'SINIFLANDIRILMIŞ' : 'GİZLİLİK: YÜKSEK'}</span>
  `;

  let html = '';
  switch (page.type) {
    case 'profile': html = renderProfile(page); break;
    case 'timeline': html = renderTimeline(page); break;
    case 'cards': html = renderCards(page); break;
    case 'grid': html = renderGrid(page); break;
    case 'links': html = renderLinks(page); break;
    case 'secret': html = renderSecret(page); break;
    default: html = '<p>Bilinmeyen dosya formatı.</p>';
  }

  pagesEl.innerHTML = `<div class="doc-page type-${page.type}">${html}</div>`;

  // Update nav
  const total = currentFolder.pages.length;
  pageInfo.textContent = `Sayfa ${currentPage + 1} / ${total}`;
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
      <div class="profile-title">${c.title}</div>
    </div>
    <h3 class="section-title">Profil</h3>
    <p class="about-text">${c.about}</p>
  `;

  if (c.languages) {
    html += `<h3 class="section-title">Diller</h3><ul class="lang-list">`;
    c.languages.forEach(l => {
      html += `<li>${l.lang} — ${l.level}</li>`;
    });
    html += `</ul>`;
  }

  if (c.hobbies) {
    html += `<h3 class="section-title">Aktiviteler</h3><ul class="hobby-list">`;
    c.hobbies.forEach(h => {
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
        <div class="tl-title">${item.title}</div>
        <div class="tl-org">${item.org}</div>
        <div class="tl-date">${item.date}</div>
        <ul class="tl-details">
          ${item.details.map(d => `<li>${d}</li>`).join('')}
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
          <span class="pc-title">${item.title}</span>
          <span class="pc-meta">${item.tech} · ${item.year}</span>
        </div>
        <p class="pc-desc">${item.description}</p>
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
        <div class="sc-name">${cat.name}</div>
        <div class="skill-tags">
          ${cat.items.map(i => `<span class="skill-tag">${i}</span>`).join('')}
        </div>
      </div>
    `;
  });
  return html;
}

function renderLinks(page) {
  let html = `<div class="contact-section"><h3>İletişim</h3>`;

  if (page.contact.email) {
    html += `
      <div class="contact-item">
        <span class="ci-label">E-POSTA</span>
        <a href="mailto:${page.contact.email}">${page.contact.email}</a>
      </div>`;
  }
  if (page.contact.phone) {
    html += `
      <div class="contact-item">
        <span class="ci-label">TELEFON</span>
        <span>${page.contact.phone}</span>
      </div>`;
  }
  html += `</div>`;

  if (page.references) {
    html += `<div class="contact-section"><h3>Referanslar</h3>`;
    page.references.forEach(ref => {
      html += `
        <div class="contact-item">
          <span class="ci-label">İSİM</span>
          <span>${ref.name}</span>
        </div>`;
      if (ref.title) {
        html += `
        <div class="contact-item">
          <span class="ci-label">ÜNVAN</span>
          <span>${ref.title}</span>
        </div>`;
      }
      html += `
        <div class="contact-item">
          <span class="ci-label">TELEFON</span>
          <span>${ref.phone}</span>
        </div>
        <hr style="border:none;border-top:1px dashed rgba(58,48,32,0.2);margin:10px 0;">`;
    });
    html += `</div>`;
  }

  return html;
}

function renderSecret(page) {
  const c = page.content;
  let html = `<div class="secret-warning">⚠ GİZLİ BİLGİ — SADECE YETKİLİ PERSONEL ⚠</div>`;

  c.funFacts.forEach(fact => {
    html += `<div class="fun-fact">${fact}</div>`;
  });

  if (c.motto) {
    html += `<div class="secret-motto">"${c.motto}"</div>`;
  }

  return html;
}
