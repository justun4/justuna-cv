let zCounter = 10;

export function getNextZ() {
  return ++zCounter;
}

export function initDesk() {
  // Desk is set up via CSS; this module manages z-index stacking
  zCounter = 10;
}
