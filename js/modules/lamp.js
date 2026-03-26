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

function onMouseMove(e) {
  targetX = (e.clientX / window.innerWidth) * 100;
  targetY = (e.clientY / window.innerHeight) * 100;
}

function onTouchMove(e) {
  const touch = e.touches[0];
  targetX = (touch.clientX / window.innerWidth) * 100;
  targetY = (touch.clientY / window.innerHeight) * 100;
}

export function initLamp() {
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('touchmove', onTouchMove, { passive: true });
  rafId = requestAnimationFrame(updateLamp);
}

export function destroyLamp() {
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('touchmove', onTouchMove);
  if (rafId) cancelAnimationFrame(rafId);
}
