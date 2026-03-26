import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { getNextZ } from './desk.js';

gsap.registerPlugin(Draggable);

const container = document.getElementById('decorations-container');
const draggableItems = [];

export function initDecorations(decorData) {
  createPen(30, 85, 35);
  createClock(85, 75);
  createSmartphone(3, 12, -15);
  createMagnifier(88, 25, -30);
  createStapler(60, 90, 10);
  createWalkieTalkie(40, 55, 75);

  if (decorData && decorData.stickyNotes) {
    decorData.stickyNotes.forEach(note => {
      createStickyNote(note.text, note.position.x, note.position.y, note.color, note.rotation);
    });
  }

  // Make all decoration items draggable
  draggableItems.forEach(el => makeDraggable(el));
}

function makeDraggable(el) {
  Draggable.create(el, {
    type: 'x,y',
    bounds: '#desk-surface',
    cursor: 'grab',
    activeCursor: 'grabbing',
    onPress() {
      el.style.zIndex = getNextZ();
    },
  });
}

function addToDesk(el) {
  container.appendChild(el);
  draggableItems.push(el);
}

function createPen(x, y, rotation) {
  const pen = document.createElement('div');
  pen.className = 'desk-pen';
  pen.style.left = `${x}%`;
  pen.style.top = `${y}%`;
  pen.style.transform = `rotate(${rotation}deg)`;
  addToDesk(pen);
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

  const gunler = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
  const aylar = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

  function updatePhone() {
    const now = new Date();
    timeEl.textContent = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    dateEl.textContent = `${gunler[now.getDay()]}, ${now.getDate()} ${aylar[now.getMonth()]}`;
  }

  updatePhone();
  setInterval(updatePhone, 1000);

  const screen = document.createElement('div');
  screen.className = 'sp-screen';
  screen.appendChild(timeEl);
  screen.appendChild(dateEl);

  const notch = document.createElement('div');
  notch.className = 'sp-notch';

  phone.appendChild(screen);
  phone.appendChild(notch);
  addToDesk(phone);
}

function createMagnifier(x, y, rotation) {
  const mag = document.createElement('div');
  mag.className = 'magnifier';
  mag.style.left = `${x}%`;
  mag.style.top = `${y}%`;
  mag.style.transform = `rotate(${rotation}deg)`;
  addToDesk(mag);
}

function createStapler(x, y, rotation) {
  const stapler = document.createElement('div');
  stapler.className = 'stapler';
  stapler.style.left = `${x}%`;
  stapler.style.top = `${y}%`;
  stapler.style.transform = `rotate(${rotation}deg)`;
  stapler.innerHTML = '<div class="stapler-front"></div>';
  addToDesk(stapler);
}

function createWalkieTalkie(x, y, rotation) {
  const wt = document.createElement('div');
  wt.className = 'walkie-talkie';
  wt.style.left = `${x}%`;
  wt.style.top = `${y}%`;
  wt.style.transform = `rotate(${rotation}deg)`;
  let keys = '';
  for (let i = 0; i < 12; i++) keys += '<div class="wt-key"></div>';
  wt.innerHTML = `<div class="wt-speaker"></div><div class="wt-screen"></div><div class="wt-keypad">${keys}</div><div class="wt-side"></div>`;
  addToDesk(wt);
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
  addToDesk(clock);
}

function createStickyNote(text, x, y, color, rotation = 0) {
  const note = document.createElement('div');
  note.className = 'sticky-note';
  note.style.left = `${x}%`;
  note.style.top = `${y}%`;
  note.style.backgroundColor = color;
  note.style.transform = `rotate(${rotation}deg)`;
  note.textContent = text;
  addToDesk(note);
}
