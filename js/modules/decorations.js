import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { getNextZ } from './desk.js';
import { playSound, stopSound } from './sounds.js';
import { t, tData, getLang, onLangChange } from './i18n.js';

gsap.registerPlugin(Draggable);

const container = document.getElementById('decorations-container');
const draggableItems = [];

export function initDecorations(decorData) {
  createPen(30, 85, 35);
  createSmartphone(3, 12, -15);
  createMagnifier(88, 25, -30);
  createStapler(60, 90, 10);
  createWalkieTalkie(40, 55, 75);

  const stickyElements = [];
  if (decorData && decorData.stickyNotes) {
    decorData.stickyNotes.forEach(note => {
      const el = createStickyNote(tData(note.text, note.text_en), note.position.x, note.position.y, note.color, note.rotation);
      stickyElements.push({ el, note });
    });
  }

  // Update sticky notes on language change
  onLangChange(() => {
    stickyElements.forEach(({ el, note }) => {
      el.textContent = tData(note.text, note.text_en);
    });
  });

  // Make all decoration items draggable
  draggableItems.forEach(({ el, sound }) => makeDraggable(el, sound));
}

function makeDraggable(el, soundName = null) {
  Draggable.create(el, {
    type: 'x,y',
    bounds: '#desk-surface',
    cursor: 'grab',
    activeCursor: 'grabbing',
    onPress() {
      el.style.zIndex = getNextZ();
    },
    onDragStart() {
      if (soundName) playSound(soundName);
    },
    onDragEnd() {
      if (soundName) stopSound(soundName);
    },
  });
}

function addToDesk(el, sound = null) {
  container.appendChild(el);
  draggableItems.push({ el, sound });
}

function createPen(x, y, rotation) {
  const pen = document.createElement('div');
  pen.className = 'desk-pen';
  pen.style.left = `${x}%`;
  pen.style.top = `${y}%`;
  pen.style.transform = `rotate(${rotation}deg)`;
  addToDesk(pen, 'desk-object');
}

function createSmartphone(x, y, rotation) {
  const phone = document.createElement('div');
  phone.className = 'smartphone';
  phone.style.left = `${x}%`;
  phone.style.top = `${y}%`;
  phone.style.transform = `rotate(${rotation}deg)`;

  const timeEl = document.createElement('div');
  timeEl.className = 'sp-time';
  const dateEl = document.createElement('div');
  dateEl.className = 'sp-date';

  function updatePhone() {
    const now = new Date();
    const days = t('days');
    const months = t('months');
    timeEl.textContent = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    dateEl.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
  }

  updatePhone();
  setInterval(updatePhone, 1000);

  // Update on language change
  onLangChange(() => updatePhone());

  const screen = document.createElement('div');
  screen.className = 'sp-screen';
  screen.appendChild(timeEl);
  screen.appendChild(dateEl);

  const notch = document.createElement('div');
  notch.className = 'sp-notch';

  phone.appendChild(screen);
  phone.appendChild(notch);
  addToDesk(phone, 'desk-object');
}

function createMagnifier(x, y, rotation) {
  const mag = document.createElement('div');
  mag.className = 'magnifier';
  mag.style.left = `${x}%`;
  mag.style.top = `${y}%`;
  mag.style.transform = `rotate(${rotation}deg)`;
  addToDesk(mag, 'desk-object');
}

function createStapler(x, y, rotation) {
  const stapler = document.createElement('div');
  stapler.className = 'stapler';
  stapler.style.left = `${x}%`;
  stapler.style.top = `${y}%`;
  stapler.style.transform = `rotate(${rotation}deg)`;
  // PNG image replaces all inner structural elements
  addToDesk(stapler, 'desk-object');
}

function createWalkieTalkie(x, y, rotation) {
  const wt = document.createElement('div');
  wt.className = 'walkie-talkie';
  wt.style.left = `${x}%`;
  wt.style.top = `${y}%`;
  wt.style.transform = `rotate(${rotation}deg)`;
  // PNG image replaces all inner structural elements
  addToDesk(wt, 'desk-object');
}

function createClock(x, y) {
  const clock = document.createElement('div');
  clock.className = 'desk-clock';
  clock.style.left = `${x}%`;
  clock.style.top = `${y}%`;

  const display = document.createElement('div');
  display.className = 'clock-display';

  function updateTime() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    display.innerHTML = `${h}<span class="clock-colon">:</span>${m}`;
  }

  updateTime();
  setInterval(updateTime, 1000);
  clock.appendChild(display);
  addToDesk(clock, 'desk-object');
}

function createStickyNote(text, x, y, color, rotation = 0) {
  const note = document.createElement('div');
  note.className = 'sticky-note';
  note.style.left = `${x}%`;
  note.style.top = `${y}%`;
  note.style.backgroundColor = color;
  note.style.transform = `rotate(${rotation}deg)`;
  note.textContent = text;
  addToDesk(note, 'note-shuffle');
  return note;
}
