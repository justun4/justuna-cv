import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { getNextZ } from './desk.js';

gsap.registerPlugin(Draggable);

let draggables = [];

export function initDraggable(folderElements) {
  draggables = [];

  folderElements.forEach(({ el }) => {
    const d = Draggable.create(el, {
      type: 'x,y',
      bounds: '#desk-surface',
      edgeResistance: 0.65,
      cursor: 'grab',
      activeCursor: 'grabbing',
      onPress() {
        el.style.zIndex = getNextZ();
      },
      onDragStart() {
        gsap.to(el, {
          scale: 1.05,
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          duration: 0.2,
        });
      },
      onDragEnd() {
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
