import { getNextZ } from './desk.js';
import { openDocument } from './documents.js';
import { playSound } from './sounds.js';

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

  const stamps = ['AKTİF', 'İNCELE', 'ÖNEMLİ', 'KAYIT', 'DOSYA'];
  const stamp = folder.id === 'secret' ? 'GİZLİ' : stamps[Math.floor(Math.random() * stamps.length)];

  el.innerHTML = `
    <div class="folder-tab"><span>${folder.tab}</span></div>
    <div class="folder-body">
      <span class="folder-stamp">${stamp}</span>
    </div>
    <div class="folder-label">${folder.label}</div>
  `;

  // Double click or tap to open
  el.addEventListener('dblclick', () => {
    openDocument(folder);
  });

  // Single click: bring to front
  el.addEventListener('mousedown', () => {
    el.style.zIndex = getNextZ();
    playSound('paper-shuffle');
  });

  // Mobile: tap to open (with delay to distinguish from drag)
  let tapTimer = null;
  let tapped = false;
  el.addEventListener('touchend', (e) => {
    if (tapped) {
      // Double tap
      clearTimeout(tapTimer);
      tapped = false;
      openDocument(folder);
      e.preventDefault();
    } else {
      tapped = true;
      tapTimer = setTimeout(() => { tapped = false; }, 300);
    }
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
