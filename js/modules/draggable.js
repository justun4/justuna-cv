import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { getNextZ } from './desk.js';
import { playSound, stopSound } from './sounds.js';
import { openDocument } from './documents.js';

gsap.registerPlugin(Draggable);

let draggables = [];

export function initDraggable(folderElements) {
  draggables = [];

  folderElements.forEach(({ el, data }) => {
    const d = Draggable.create(el, {
      type: 'x,y',
      bounds: '#desk-surface',
      edgeResistance: 0.65,
      cursor: 'grab',
      activeCursor: 'grabbing',
      minimumMovement: 3,
      allowEventDefault: true,
      onPress() {
        el.style.zIndex = getNextZ();
      },
      onClick() {
        // GSAP fires onClick only when no drag occurred
        openDocument(data);
      },
      onDragStart() {
        playSound('paper-shuffle');
        gsap.to(el, {
          scale: 1.05,
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          duration: 0.2,
        });
      },
      onDragEnd() {
        stopSound('paper-shuffle');
        gsap.to(el, {
          scale: 1,
          boxShadow: 'none',
          duration: 0.3,
          ease: 'power2.out',
        });
      },
    })[0];

    draggables.push(d);
  });

  return draggables;
}

export function disableAllDraggables() {
  draggables.forEach(d => d.disable());
  // Also disable all GSAP Draggable instances on the page
  Draggable.get('.folder')?.forEach?.(d => d.disable());
}

export function enableAllDraggables() {
  draggables.forEach(d => d.enable());
}
