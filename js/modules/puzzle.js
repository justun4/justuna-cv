import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { playSound } from './sounds.js';
import { openDocument } from './documents.js';

gsap.registerPlugin(Draggable);

let mugDraggable = null;
let usbDraggable = null;
let puzzleState = {
  mugMoved: false,
  buttonPressed: false,
  usbInserted: false,
};

export function initPuzzle(secretFolderData) {
  const mug = document.getElementById('puzzle-mug');
  const hiddenButton = document.getElementById('hidden-button');
  const usb = document.getElementById('puzzle-usb');
  const panelClose = document.getElementById('panel-close');

  if (!mug || !hiddenButton || !usb) return;

  // Step 1: Make coffee mug draggable
  mugDraggable = Draggable.create(mug, {
    type: 'x,y',
    bounds: '#desk-surface',
    cursor: 'grab',
    activeCursor: 'grabbing',
    onDragStart() {
      gsap.to(mug, { scale: 1.1, duration: 0.2 });
    },
    onDrag() {
      checkMugPosition();
    },
    onDragEnd() {
      gsap.to(mug, { scale: 1, duration: 0.2 });
      checkMugPosition();
    },
  })[0];

  // Step 2: Hidden button click → open terminal panel
  hiddenButton.addEventListener('click', () => {
    if (puzzleState.buttonPressed) return;
    puzzleState.buttonPressed = true;
    playSound('folder-open');

    gsap.to(hiddenButton, {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      onComplete() {
        hiddenButton.classList.add('pressed');
        showPanel();
      },
    });
  });

  // Panel close
  panelClose.addEventListener('click', hidePanel);

  // Step 3: Make USB draggable
  usbDraggable = Draggable.create(usb, {
    type: 'x,y',
    bounds: '#desk-surface',
    cursor: 'grab',
    activeCursor: 'grabbing',
    onDragStart() {
      gsap.to(usb, { scale: 1.15, duration: 0.15 });
    },
    onDrag() {
      if (puzzleState.buttonPressed && !puzzleState.usbInserted) {
        checkUsbInSlot(false);
      }
    },
    onDragEnd() {
      gsap.to(usb, { scale: 1, duration: 0.15 });
      if (puzzleState.buttonPressed && !puzzleState.usbInserted) {
        checkUsbInSlot(true);
      }
    },
  })[0];

  // Store secret folder data
  window.__secretFolderData = secretFolderData;
}

function checkMugPosition() {
  if (puzzleState.mugMoved) return;

  const mug = document.getElementById('puzzle-mug');
  const button = document.getElementById('hidden-button');
  const mugRect = mug.getBoundingClientRect();
  const btnRect = button.getBoundingClientRect();

  const distance = Math.sqrt(
    Math.pow((mugRect.left + mugRect.width / 2) - (btnRect.left + btnRect.width / 2), 2) +
    Math.pow((mugRect.top + mugRect.height / 2) - (btnRect.top + btnRect.height / 2), 2)
  );

  if (distance > 80) {
    puzzleState.mugMoved = true;
    gsap.to(button, {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: 'back.out(1.7)',
    });
    button.style.pointerEvents = 'auto';
  }
}

function showPanel() {
  const panel = document.getElementById('secret-panel');
  const overlay = document.getElementById('puzzle-overlay');

  overlay.classList.remove('hidden');
  panel.classList.remove('hidden');

  gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
  gsap.fromTo(panel,
    { opacity: 0, scale: 0.9, y: 20 },
    { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power2.out' }
  );

  // Animate terminal lines one by one
  const lines = panel.querySelectorAll('.terminal-lines .term-line');
  lines.forEach((line, i) => {
    const delay = parseInt(line.dataset.delay) || i * 600;
    setTimeout(() => {
      line.classList.add('visible');
    }, delay + 300);
  });

  // Highlight USB with glow
  const usb = document.getElementById('puzzle-usb');
  setTimeout(() => {
    usb.classList.add('usb-hint');
  }, 2500);
}

function hidePanel() {
  const panel = document.getElementById('secret-panel');
  const overlay = document.getElementById('puzzle-overlay');

  gsap.to(panel, { opacity: 0, scale: 0.95, duration: 0.25 });
  gsap.to(overlay, {
    opacity: 0, duration: 0.25,
    onComplete() {
      panel.classList.add('hidden');
      overlay.classList.add('hidden');
    }
  });
}

function checkUsbInSlot(dropped) {
  const usb = document.getElementById('puzzle-usb');
  const slot = document.getElementById('usb-slot');
  const usbRect = usb.getBoundingClientRect();
  const slotRect = slot.getBoundingClientRect();

  const usbCenterX = usbRect.left + usbRect.width / 2;
  const usbCenterY = usbRect.top + usbRect.height / 2;

  const isOverSlot =
    usbCenterX > slotRect.left &&
    usbCenterX < slotRect.right &&
    usbCenterY > slotRect.top &&
    usbCenterY < slotRect.bottom;

  if (isOverSlot) {
    slot.classList.add('slot-active');
  } else {
    slot.classList.remove('slot-active');
  }

  if (isOverSlot && dropped) {
    puzzleState.usbInserted = true;
    slot.classList.add('slot-filled');
    usb.classList.remove('usb-hint');
    usb.classList.add('usb-active');
    playSound('folder-open');

    // Snap USB into slot
    const slotCenterX = slotRect.left + slotRect.width / 2 - usbRect.width / 2;
    const slotCenterY = slotRect.top + slotRect.height / 2 - usbRect.height / 2;

    gsap.to(usb, {
      x: `+=${slotCenterX - usbRect.left}`,
      y: `+=${slotCenterY - usbRect.top}`,
      rotation: 0,
      scale: 0.9,
      duration: 0.3,
      ease: 'power2.inOut',
    });

    if (usbDraggable) usbDraggable.disable();

    // Show terminal post-insert lines
    setTimeout(() => runUnlockSequence(), 600);
  }
}

function runUnlockSequence() {
  const termPost = document.getElementById('terminal-post');
  const statusText = document.getElementById('panel-status');

  termPost.classList.remove('hidden');
  const postLines = termPost.querySelectorAll('.term-line');

  // Animate each post-insert line
  postLines.forEach((line, i) => {
    setTimeout(() => {
      line.style.opacity = '1';
      line.style.transform = 'translateX(0)';
    }, i * 500);
  });

  // After all lines shown, update status and unlock
  const totalDelay = postLines.length * 500 + 500;

  setTimeout(() => {
    statusText.textContent = 'ERİŞİM SAĞLANDI';
    statusText.classList.add('access-granted');
  }, totalDelay);

  setTimeout(() => {
    unlockAndClose();
  }, totalDelay + 1200);
}

function unlockAndClose() {
  const panel = document.getElementById('secret-panel');
  const overlay = document.getElementById('puzzle-overlay');

  // Flash green
  gsap.to(panel, {
    borderColor: '#00ff00',
    boxShadow: '0 0 50px rgba(0, 255, 0, 0.3)',
    duration: 0.3,
    yoyo: true,
    repeat: 1,
    onComplete() {
      // Close panel
      gsap.to(panel, { opacity: 0, scale: 1.05, duration: 0.4 });
      gsap.to(overlay, {
        opacity: 0, duration: 0.4,
        onComplete() {
          panel.classList.add('hidden');
          overlay.classList.add('hidden');

          // Reveal secret folder
          const secretEl = document.querySelector('.secret-folder');
          if (secretEl) {
            secretEl.classList.add('revealed');
            gsap.fromTo(secretEl,
              { scale: 0.5, opacity: 0, rotation: -10 },
              {
                scale: 1, opacity: 1, rotation: 8, duration: 0.6,
                ease: 'back.out(2)',
                onComplete() {
                  if (window.__secretFolderData) {
                    setTimeout(() => {
                      openDocument(window.__secretFolderData);
                    }, 500);
                  }
                }
              }
            );
          }
        }
      });
    }
  });
}
