import { initDesk } from './modules/desk.js';
import { initLamp } from './modules/lamp.js';
import { initFolders } from './modules/folders.js';
import { initDraggable } from './modules/draggable.js';
import { initDocuments } from './modules/documents.js';
import { initSounds } from './modules/sounds.js';
import { initDecorations } from './modules/decorations.js';
import { initPuzzle } from './modules/puzzle.js';
import cvData from './data/cv-data.json';

function init() {
  // Initialize core systems
  initDesk();
  initLamp();
  initSounds();
  initDocuments();

  // Create folders from CV data
  const folderElements = initFolders(cvData.folders);

  // Initialize draggable on all folders
  initDraggable(folderElements);

  // Create decorations
  initDecorations(cvData.decorations);

  // Initialize puzzle (secret file mini-game)
  const secretFolder = cvData.folders.find(f => f.id === 'secret');
  initPuzzle(secretFolder);

  // Setup intro
  setupIntro();
}

function setupIntro() {
  const introOverlay = document.getElementById('intro-overlay');
  const startBtn = document.getElementById('intro-start');

  startBtn.addEventListener('click', () => {
    introOverlay.classList.add('fade-out');
    setTimeout(() => {
      introOverlay.remove();
    }, 800);
  });
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
