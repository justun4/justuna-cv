const lampLight = document.getElementById('lamp-light');
let rafId = null;
let targetX = 50;
let targetY = 50;
let currentX = 50;
let currentY = 50;

function updateLamp() {
  currentX += (targetX - currentX) * 0.08;
  currentY += (targetY - currentY) * 0.08;

  document.documentElement.style.setProperty('--mouse-x', `${currentX}%`);
  document.documentElement.style.setProperty('--mouse-y', `${currentY}%`);

  rafId = requestAnimationFrame(updateLamp);
}

function onPointerMove(e) {
  targetX = (e.clientX / window.innerWidth) * 100;
  targetY = (e.clientY / window.innerHeight) * 100;
}

function onTouchMove(e) {
  const touch = e.touches[0];
  targetX = (touch.clientX / window.innerWidth) * 100;
  targetY = (touch.clientY / window.innerHeight) * 100;
}

export function initLamp() {
  // pointermove fires even during GSAP Draggable operations
  document.addEventListener('pointermove', onPointerMove, { capture: true, passive: true });
  document.addEventListener('mousemove', onPointerMove, { capture: true, passive: true });
  document.addEventListener('touchmove', onTouchMove, { capture: true, passive: true });
  rafId = requestAnimationFrame(updateLamp);
}

export function destroyLamp() {
  document.removeEventListener('pointermove', onPointerMove);
  document.removeEventListener('mousemove', onPointerMove);
  document.removeEventListener('touchmove', onTouchMove);
  if (rafId) cancelAnimationFrame(rafId);
}
