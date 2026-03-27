import { getNextZ } from './desk.js';
import { openDocument } from './documents.js';
import { playSound } from './sounds.js';
import { t, tData, onLangChange } from './i18n.js';

const container = document.getElementById('folders-container');
let folderElements = [];
let secretFolder = null;

export function initFolders(foldersData) {
  folderElements = [];

  foldersData.forEach(folder => {
    // Skip secret folder - handled by puzzle system
    if (folder.hidden) return;

    const el = createFolderElement(folder);
    container.appendChild(el);
    folderElements.push({ el, data: folder });
  });

  // Register language change to update folder labels/tabs/stamps
  onLangChange(() => {
    folderElements.forEach(({ el, data }) => {
      const labelEl = el.querySelector('.folder-label');
      const tabSpan = el.querySelector('.folder-tab span');
      const stampEl = el.querySelector('.folder-stamp');

      if (labelEl) labelEl.textContent = tData(data.label, data.label_en);
      if (tabSpan) tabSpan.textContent = tData(data.tab, data.tab_en);
      if (stampEl) {
        const stamps = t('folder.stamps');
        if (data.id === 'secret') {
          stampEl.textContent = t('folder.secret');
        } else {
          stampEl.textContent = stamps[Math.floor(Math.random() * stamps.length)];
        }
      }
    });
  });

  return folderElements;
}

function createFolderElement(folder) {
  const el = document.createElement('div');
  el.className = 'folder';
  el.dataset.folderId = folder.id;
  el.style.setProperty('--folder-color', folder.color);

  // Position (percentage based)
  el.style.left = `${folder.position.x}%`;
  el.style.top = `${folder.position.y}%`;
  el.style.transform = `rotate(${folder.position.rotation}deg)`;

  const stamps = t('folder.stamps');
  const stamp = folder.id === 'secret' ? t('folder.secret') : stamps[Math.floor(Math.random() * stamps.length)];

  el.innerHTML = `
    <div class="folder-tab"><span>${tData(folder.tab, folder.tab_en)}</span></div>
    <div class="folder-body">
      <span class="folder-stamp">${stamp}</span>
    </div>
    <div class="folder-label">${tData(folder.label, folder.label_en)}</div>
  `;

  // Bring to front
  el.addEventListener('mousedown', () => {
    el.style.zIndex = getNextZ();
  });

  return el;
}

export function revealSecretFolder() {
  if (secretFolder) {
    secretFolder.classList.add('revealed');
  }
}

export function getFolderElements() {
  return folderElements;
}
