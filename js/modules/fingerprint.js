import { gsap } from 'gsap';
import { playSound } from './sounds.js';
import { t, tData, onLangChange } from './i18n.js';

let cvDataRef = null;

export function initFingerprint(cvData) {
  cvDataRef = cvData;

  // Listen for double-click on magnifier
  const magnifier = document.querySelector('.magnifier');
  if (!magnifier) return;

  let startX = 0, startY = 0;
  magnifier.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
    startY = e.clientY;
  });
  magnifier.addEventListener('pointerup', (e) => {
    const dist = Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY);
    if (dist < 10) {
      e.stopPropagation();
      openFingerprintScanner();
    }
  });

  onLangChange(() => {
    const overlay = document.querySelector('.fingerprint-overlay');
    if (overlay) overlay.remove();
  });
}

function drawFingerprint(canvas, seed, size) {
  const ctx = canvas.getContext('2d');
  canvas.width = size;
  canvas.height = size;
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const rng = seedRNG(seed);

  ctx.strokeStyle = 'rgba(180, 220, 255, 0.6)';
  ctx.lineWidth = 1.2;

  // Draw concentric elliptical curves with noise
  for (let r = 6; r < size / 2 - 8; r += 3.5) {
    ctx.beginPath();
    const xStretch = 0.7 + rng() * 0.6;
    const yStretch = 0.7 + rng() * 0.6;
    const offsetX = (rng() - 0.5) * 4;
    const offsetY = (rng() - 0.5) * 4;

    for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
      const noiseVal = (rng() - 0.5) * 2;
      const rx = r * xStretch + noiseVal;
      const ry = r * yStretch + noiseVal;
      const x = cx + offsetX + rx * Math.cos(angle);
      const y = cy + offsetY + ry * Math.sin(angle);

      if (angle === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }
}

function seedRNG(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function openFingerprintScanner() {
  playSound('fingerprint-scan');

  const overlay = document.createElement('div');
  overlay.className = 'fingerprint-overlay';
  overlay.style.zIndex = 200;

  // Generate target and distractors
  const targetSeed = Math.floor(Math.random() * 10000);
  const seeds = [targetSeed];
  while (seeds.length < 4) {
    const s = Math.floor(Math.random() * 10000);
    if (!seeds.includes(s)) seeds.push(s);
  }

  // Shuffle candidates
  const correctIndex = Math.floor(Math.random() * 4);
  const candidateSeeds = [];
  let si = 1;
  for (let i = 0; i < 4; i++) {
    if (i === correctIndex) {
      candidateSeeds.push(targetSeed);
    } else {
      candidateSeeds.push(seeds[si++]);
    }
  }

  // Get project data for success display
  const projects = cvDataRef?.folders?.find(f => f.id === 'projects');
  const projectItems = projects?.pages?.[0]?.items || [];

  let wrongCount = 0;

  overlay.innerHTML = `
    <div class="fp-backdrop"></div>
    <div class="fp-panel">
      <button class="overlay-close-btn" aria-label="Close">&times;</button>
      <div class="fp-title">${t('fp.title')}</div>
      <div class="fp-subtitle">${t('fp.subtitle')}</div>
      <div class="fp-target-area">
        <div class="fp-label">${t('fp.target')}</div>
        <canvas class="fp-target-canvas" width="120" height="120"></canvas>
      </div>
      <div class="fp-candidates">
        ${candidateSeeds.map((s, i) => `
          <div class="fp-candidate" data-index="${i}" data-seed="${s}">
            <canvas class="fp-candidate-canvas" width="90" height="90"></canvas>
            <div class="fp-candidate-label">#${i + 1}</div>
          </div>
        `).join('')}
      </div>
      <div class="fp-hint hidden">${t('fp.hint')}</div>
      <div class="fp-result hidden"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Draw fingerprints
  const targetCanvas = overlay.querySelector('.fp-target-canvas');
  drawFingerprint(targetCanvas, targetSeed, 120);

  overlay.querySelectorAll('.fp-candidate-canvas').forEach((canvas, i) => {
    drawFingerprint(canvas, candidateSeeds[i], 90);
  });

  // Handle candidate taps (pointerup for mobile compatibility)
  overlay.querySelectorAll('.fp-candidate').forEach((el) => {
    el.addEventListener('pointerup', (e) => {
      e.stopPropagation();
      const seed = parseInt(el.dataset.seed);
      const resultEl = overlay.querySelector('.fp-result');

      if (seed === targetSeed) {
        // Correct match
        playSound('access-granted');
        el.classList.add('correct');
        resultEl.classList.remove('hidden');
        resultEl.className = 'fp-result success';

        let projectHTML = '';
        if (projectItems.length > 0) {
          const p = projectItems[Math.floor(Math.random() * projectItems.length)];
          projectHTML = `<div class="fp-project"><strong>${tData(p.title, p.title_en)}</strong> (${p.tech}, ${p.year})<br>${tData(p.description, p.description_en)}</div>`;
        }

        resultEl.innerHTML = `
          <div class="fp-success-title">${t('fp.found')}</div>
          ${projectHTML}
          <a href="https://github.com/justun4" target="_blank" class="fp-social-link" onclick="event.stopPropagation()">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            <span>${t('fp.github')}</span>
          </a>
        `;

        // Disable further clicks
        overlay.querySelectorAll('.fp-candidate').forEach(c => {
          c.style.pointerEvents = 'none';
        });

        gsap.fromTo(el, { scale: 1 }, { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1 });
      } else {
        // Wrong match
        wrongCount++;
        playSound('cipher-click');
        el.classList.add('wrong');

        gsap.to(el, {
          x: -5, duration: 0.05, repeat: 5, yoyo: true,
          onComplete() { gsap.set(el, { x: 0 }); }
        });

        setTimeout(() => el.classList.remove('wrong'), 600);

        if (wrongCount >= 3) {
          overlay.querySelector('.fp-hint').classList.remove('hidden');
        }
      }
    });
  });

  // Close on backdrop
  overlay.querySelector('.fp-backdrop').addEventListener('pointerup', () => {
    gsap.to(overlay, {
      opacity: 0, duration: 0.3,
      onComplete() { overlay.remove(); }
    });
  });

  // Close on X button
  overlay.querySelector('.overlay-close-btn').addEventListener('pointerup', (e) => {
    e.stopPropagation();
    gsap.to(overlay, {
      opacity: 0, duration: 0.3,
      onComplete() { overlay.remove(); }
    });
  });
}
