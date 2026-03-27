import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { getNextZ } from './desk.js';
import { playSound } from './sounds.js';

gsap.registerPlugin(Draggable);

const STORAGE_KEY = 'detective-desk-user-notes';
const COLORS = ['#f7e47a', '#ff9e80', '#80d8ff', '#b9f6ca', '#f8bbd0'];
let notes = [];

export function initUserNotes() {
  // Create add button (fixed bottom-left, matching sound toggle style)
  const addBtn = document.createElement('button');
  addBtn.id = 'add-note-btn';
  addBtn.title = 'Not Ekle';
  addBtn.textContent = '+';
  document.body.appendChild(addBtn);

  addBtn.addEventListener('click', () => {
    createNote({
      id: Date.now().toString(),
      text: '',
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
    });
    playSound('note-crumple');
  });

  // Load saved notes
  loadNotes();
}

function loadNotes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.forEach(note => createNote(note, false));
    }
  } catch {}
}

function saveNotes() {
  try {
    const data = notes.map(n => ({
      id: n.id,
      text: n.el.querySelector('.user-note-text').textContent,
      color: n.color,
      x: parseFloat(n.el.style.left),
      y: parseFloat(n.el.style.top),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

let saveTimeout = null;
function debouncedSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveNotes, 500);
}

function createNote(data, isNew = true) {
  const desk = document.getElementById('desk-surface');
  if (!desk) return;

  const note = document.createElement('div');
  note.className = 'user-note';
  note.style.left = `${data.x}px`;
  note.style.top = `${data.y}px`;
  note.style.backgroundColor = data.color;
  note.style.zIndex = getNextZ();
  note.style.transform = `rotate(${(Math.random() - 0.5) * 6}deg)`;

  note.innerHTML = `
    <div class="user-note-header">
      <div class="user-note-drag-area"></div>
      <button class="user-note-delete" title="Sil">&times;</button>
    </div>
    <div class="user-note-text" contenteditable="true" spellcheck="false">${data.text || ''}</div>
  `;

  desk.appendChild(note);

  const noteObj = { id: data.id, el: note, color: data.color };
  notes.push(noteObj);

  // Make draggable from header area
  Draggable.create(note, {
    type: 'x,y',
    bounds: '#desk-surface',
    trigger: note.querySelector('.user-note-drag-area'),
    cursor: 'grab',
    activeCursor: 'grabbing',
    onPress() {
      note.style.zIndex = getNextZ();
    },
    onDragStart() {
      playSound('note-crumple');
      gsap.to(note, { scale: 1.05, duration: 0.15 });
    },
    onDragEnd() {
      gsap.to(note, { scale: 1, duration: 0.15 });
      // Update position from transform
      const rect = note.getBoundingClientRect();
      const deskRect = desk.getBoundingClientRect();
      noteObj.lastX = rect.left - deskRect.left;
      noteObj.lastY = rect.top - deskRect.top;
      debouncedSave();
    },
  });

  // Text change -> save
  const textEl = note.querySelector('.user-note-text');
  textEl.addEventListener('input', debouncedSave);

  // Prevent drag when editing text
  textEl.addEventListener('mousedown', (e) => e.stopPropagation());
  textEl.addEventListener('touchstart', (e) => e.stopPropagation());

  // Delete button
  note.querySelector('.user-note-delete').addEventListener('click', (e) => {
    e.stopPropagation();
    playSound('note-crumple');
    gsap.to(note, {
      scale: 0, opacity: 0, duration: 0.2,
      onComplete() {
        note.remove();
        notes = notes.filter(n => n.id !== data.id);
        saveNotes();
      }
    });
  });

  if (isNew) {
    gsap.fromTo(note,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.5)' }
    );
    debouncedSave();
  }
}
