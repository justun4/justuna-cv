import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { getNextZ } from './desk.js';
import { playSound, stopSound } from './sounds.js';
import { t, onLangChange } from './i18n.js';

gsap.registerPlugin(Draggable);

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ENCODED_MESSAGE = 'WXQDKDQ KXVHP';
const SHIFT = 3;
const DECODED_MESSAGE = 'TUNAHAN HUSEM';

export function initCipher() {
  const desk = document.getElementById('desk-surface');
  if (!desk) return;

  // Create cipher device on desk
  const device = document.createElement('div');
  device.className = 'cipher-device';
  device.style.left = '6%';
  device.style.top = '48%';
  desk.appendChild(device);

  // Create tick marks around the outer ring
  let ticks = '';
  for (let i = 0; i < 26; i++) {
    const angle = (i * 360 / 26) - 90;
    const isMajor = i % 5 === 0;
    ticks += `<div class="cipher-tick${isMajor ? ' major' : ''}" style="transform: rotate(${angle}deg)"></div>`;
  }
  device.innerHTML = `
    <div class="cipher-ticks">${ticks}</div>
    <div class="cipher-inner-mark">
      <div class="cipher-inner-symbol">&#9883;</div>
    </div>
  `;

  let isDragging = false;

  // Draggable
  Draggable.create(device, {
    type: 'x,y',
    bounds: '#desk-surface',
    cursor: 'grab',
    activeCursor: 'grabbing',
    minimumMovement: 3,
    onPress() {
      device.style.zIndex = getNextZ();
    },
    onClick() {
      openCipherOverlay();
    },
    onDragStart() {
      playSound('desk-object');
      gsap.to(device, { scale: 1.05, duration: 0.2 });
    },
    onDragEnd() {
      stopSound('desk-object');
      gsap.to(device, { scale: 1, duration: 0.2 });
    },
  });

  onLangChange(() => {
    const overlay = document.querySelector('.cipher-overlay');
    if (overlay) overlay.remove();
  });
}

function openCipherOverlay() {
  playSound('cipher-click');

  document.getElementById('desk-surface').style.pointerEvents = 'none';

  const overlay = document.createElement('div');
  overlay.className = 'cipher-overlay';
  overlay.style.zIndex = 200;

  overlay.innerHTML = `
    <div class="cipher-backdrop"></div>
    <div class="cipher-panel">
      <button class="overlay-close-btn" aria-label="Close">&times;</button>
      <div class="cipher-title">${t('cipher.title')}</div>
      <div class="cipher-subtitle">${t('cipher.subtitle')}</div>
      <div class="cipher-wheel-container">
        <div class="cipher-wheel">
          <div class="cipher-outer-ring"></div>
          <div class="cipher-inner-ring"></div>
          <div class="cipher-center-dot"></div>
        </div>
      </div>
      <div class="cipher-display">
        <div class="cipher-encoded-label">${t('cipher.encoded')}</div>
        <div class="cipher-encoded">${ENCODED_MESSAGE}</div>
        <div class="cipher-decoded-label">${t('cipher.decoded')}</div>
        <div class="cipher-decoded">???</div>
      </div>
      <div class="cipher-result hidden"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Place letters around rings
  const outerRing = overlay.querySelector('.cipher-outer-ring');
  const innerRing = overlay.querySelector('.cipher-inner-ring');

  ALPHABET.split('').forEach((letter, i) => {
    const angle = (i / 26) * 360 - 90;
    const outerLetter = document.createElement('span');
    outerLetter.className = 'cipher-letter outer';
    outerLetter.textContent = letter;
    outerLetter.style.transform = `rotate(${angle}deg) translateY(-105px) rotate(${-angle}deg)`;
    outerRing.appendChild(outerLetter);

    const innerLetter = document.createElement('span');
    innerLetter.className = 'cipher-letter inner';
    innerLetter.textContent = letter;
    innerLetter.style.transform = `rotate(${angle}deg) translateY(-72px) rotate(${-angle}deg)`;
    innerRing.appendChild(innerLetter);
  });

  // Make inner ring rotatable
  let currentShift = 0;
  let solved = false;

  Draggable.create(innerRing, {
    type: 'rotation',
    inertia: false,
    onDrag() {
      playSound('cipher-click');
      updateDecode(this.rotation, overlay);
    },
    onDragEnd() {
      // Snap to nearest letter position
      const snapAngle = Math.round(this.rotation / (360 / 26)) * (360 / 26);
      gsap.to(innerRing, {
        rotation: snapAngle,
        duration: 0.2,
        ease: 'power2.out',
        onComplete() {
          const shift = Math.round(snapAngle / (360 / 26)) % 26;
          currentShift = ((shift % 26) + 26) % 26;
          const decoded = decodeMessage(ENCODED_MESSAGE, currentShift);
          overlay.querySelector('.cipher-decoded').textContent = decoded;

          if (decoded === DECODED_MESSAGE && !solved) {
            solved = true;
            celebrateSolve(overlay);
          }
        }
      });
    },
  });

  function closeCipher() {
    overlay.remove();
    document.getElementById('desk-surface').style.pointerEvents = '';
  }

  // Close on backdrop
  overlay.querySelector('.cipher-backdrop').addEventListener('pointerup', () => {
    closeCipher();
  });

  // Close on X button
  overlay.querySelector('.overlay-close-btn').addEventListener('pointerup', (e) => {
    e.stopPropagation();
    closeCipher();
  });
}

function updateDecode(rotation, overlay) {
  const shift = Math.round(rotation / (360 / 26)) % 26;
  const normalizedShift = ((shift % 26) + 26) % 26;
  const decoded = decodeMessage(ENCODED_MESSAGE, normalizedShift);
  overlay.querySelector('.cipher-decoded').textContent = decoded;
}

function decodeMessage(encoded, shift) {
  return encoded.split('').map(ch => {
    const idx = ALPHABET.indexOf(ch);
    if (idx === -1) return ch;
    return ALPHABET[(idx - shift + 26) % 26];
  }).join('');
}

function celebrateSolve(overlay) {
  playSound('access-granted');

  const resultEl = overlay.querySelector('.cipher-result');
  resultEl.classList.remove('hidden');
  resultEl.innerHTML = `
    <div class="cipher-success-title">${t('cipher.solved')}</div>
    <a href="https://www.linkedin.com/in/tunahanhusem/" target="_blank" class="cipher-social-link" onclick="event.stopPropagation()">
      <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      <span>${t('cipher.linkedin')}</span>
    </a>
  `;

  overlay.querySelector('.cipher-panel').classList.add('solved');

  gsap.fromTo(resultEl,
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.5 }
  );
}
