// Global overlay guard — prevents multiple overlays from stacking
let activeOverlay = null;

export function isOverlayOpen() {
  return activeOverlay !== null;
}

export function setOverlay(name) {
  activeOverlay = name;
}

export function clearOverlay() {
  activeOverlay = null;
}
