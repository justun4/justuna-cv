import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { playSound } from './sounds.js';
import { openDocument } from './documents.js';
import { getNextZ } from './desk.js';

gsap.registerPlugin(Draggable);

let mugDraggable = null;
let usbDraggable = null;
let secretLidDraggable = null;
let puzzleState = {
  mugMoved: false,
  buttonPressed: false,
  usbInserted: false,
  secretRevealed: false,
};

export function initPuzzle(secretFolderData) {
  const mug = document.getElementById('puzzle-mug');
  const hiddenButton = document.getElementById('hidden-button');
  const usb = document.getElementById('puzzle-usb');

  if (!mug || !hiddenButton || !usb) return;

  // Store for later
  window.__secretFolderData = secretFolderData;

  // Step 1: Make coffee mug draggable (always on top)
  mugDraggable = Draggable.create(mug, {
    type: 'x,y',
    bounds: '#desk-surface',
    cursor: 'grab',
    activeCursor: 'grabbing',
    onPress() {
      mug.style.zIndex = getNextZ();
    },
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

  // Step 2: Hidden button click → slide open desk compartment
  hiddenButton.addEventListener('click', () => {
    if (puzzleState.buttonPressed) return;
    puzzleState.buttonPressed = true;
    playSound('folder-open');

    gsap.to(hiddenButton, {
      scale: 0.9, duration: 0.1, yoyo: true, repeat: 1,
      onComplete() {
        hiddenButton.classList.add('pressed');
        openCompartment();
      },
    });
  });

  // Step 3: Make USB draggable
  usbDraggable = Draggable.create(usb, {
    type: 'x,y',
    bounds: '#desk-surface',
    zIndexBoost: false,
    cursor: 'grab',
    activeCursor: 'grabbing',
    onDragStart() {
      gsap.to(usb, { scale: 1.15, duration: 0.15 });
    },
    onDrag() {
      if (puzzleState.buttonPressed && !puzzleState.usbInserted) {
        checkUsbInPort(false);
      }
    },
    onDragEnd() {
      gsap.to(usb, { scale: 1, duration: 0.15 });
      usb.style.zIndex = '10';
      if (puzzleState.buttonPressed && !puzzleState.usbInserted) {
        checkUsbInPort(true);
      }
    },
  })[0];
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

  if (distance > 50) {
    puzzleState.mugMoved = true;
    // Instant reveal - button was always there, just hidden under the mug
    button.style.opacity = '1';
    button.style.scale = '1';
    button.style.pointerEvents = 'auto';
  }
}

function openCompartment() {
  const compartment = document.getElementById('desk-compartment');
  const lid = document.getElementById('compartment-lid');

  compartment.classList.remove('hidden');
  // Panel stays at desk level (z-index 4) - user must move folders away to see it

  // Make lid draggable - user must slide it open
  Draggable.create(lid, {
    type: 'x',
    bounds: { minX: -270, maxX: 0 },
    cursor: 'grab',
    activeCursor: 'grabbing',
    onDragEnd() {
      if (Math.abs(this.x) > 120) {
        // Fully open - slide rest of the way
        gsap.to(lid, {
          x: -270, duration: 0.3, ease: 'power2.out',
          onComplete() {
            lid.style.display = 'none';
            startTerminalSequence();
          }
        });
      } else {
        // Snap back closed
        gsap.to(lid, { x: 0, duration: 0.3, ease: 'power2.out' });
      }
    },
  });
}

function startTerminalSequence() {
  const compartment = document.getElementById('desk-compartment');

  // Animate terminal lines
  const lines = compartment.querySelectorAll('.terminal-lines .term-line');
  lines.forEach((line) => {
    const delay = parseInt(line.dataset.delay) || 0;
    setTimeout(() => {
      line.classList.add('visible');
    }, delay + 300);
  });

  // Highlight USB after terminal text
  const usb = document.getElementById('puzzle-usb');
  setTimeout(() => {
    usb.classList.add('usb-hint');
  }, 2500);
}

function checkUsbInPort(dropped) {
  const usb = document.getElementById('puzzle-usb');
  const port = document.getElementById('usb-port');
  if (!port) return;

  const usbRect = usb.getBoundingClientRect();
  const portRect = port.getBoundingClientRect();

  const usbCenterX = usbRect.left + usbRect.width / 2;
  const usbCenterY = usbRect.top + usbRect.height / 2;

  const isOverPort =
    usbCenterX > portRect.left - 25 &&
    usbCenterX < portRect.right + 25 &&
    usbCenterY > portRect.top - 25 &&
    usbCenterY < portRect.bottom + 25;

  if (isOverPort) {
    port.classList.add('port-active');
  } else {
    port.classList.remove('port-active');
  }

  if (isOverPort && dropped) {
    puzzleState.usbInserted = true;
    port.classList.remove('port-active');
    port.classList.add('port-filled');
    usb.classList.remove('usb-hint');
    usb.classList.add('usb-active', 'usb-inserted');
    playSound('folder-open');

    if (usbDraggable) usbDraggable.disable();

    // Simple two-step animation using getBoundingClientRect
    const portHole = port.querySelector('.port-hole');
    const holeRect = portHole.getBoundingClientRect();

    const holeCenterX = holeRect.left + holeRect.width / 2;
    const holeCenterY = holeRect.top + holeRect.height / 2;
    const usbCurX = usbRect.left + usbRect.width / 2;
    const usbCurY = usbRect.top + usbRect.height / 2;

    const tl = gsap.timeline();

    // Step 1: Move to port, rotate 90° (connector points down)
    tl.to(usb, {
      x: `+=${holeCenterX - usbCurX}`,
      y: `+=${holeCenterY - usbCurY - 20}`,
      rotation: 90,
      scale: 0.6,
      duration: 0.35,
      ease: 'power2.out',
    });

    // Step 2: Slide down into port
    tl.to(usb, {
      y: `+=20`,
      duration: 0.25,
      ease: 'power3.in',
    });

    // Step 3: Clip connector, only body back visible
    tl.call(() => {
      usb.style.clipPath = 'inset(0 55% 0 0)';
      usb.classList.add('usb-active');
      setTimeout(() => runUnlockSequence(), 400);
    });
  }
}

function runUnlockSequence() {
  const termPost = document.getElementById('terminal-post');
  const statusText = document.getElementById('panel-status');

  termPost.classList.remove('hidden');
  const postLines = termPost.querySelectorAll('.term-line');

  postLines.forEach((line, i) => {
    setTimeout(() => {
      line.style.opacity = '1';
      line.style.transform = 'translateX(0)';
    }, i * 500);
  });

  const totalDelay = postLines.length * 500 + 500;

  setTimeout(() => {
    statusText.textContent = 'ERİŞİM SAĞLANDI';
    statusText.classList.add('access-granted');
  }, totalDelay);

  setTimeout(() => {
    revealSecretCompartment();
  }, totalDelay + 1000);
}

function revealSecretCompartment() {
  const secretComp = document.getElementById('secret-compartment');
  const secretLid = document.getElementById('secret-lid');
  const secretInside = document.getElementById('secret-inside');

  // Create the secret folder inside the compartment
  const folderEl = document.createElement('div');
  folderEl.className = 'folder secret-folder revealed';
  folderEl.style.cssText = 'position:relative; left:auto; top:auto; transform:none; cursor:pointer;';
  folderEl.innerHTML = `
    <div class="folder-tab" style="--folder-color:#8b0000; background:#8b0000;">
      <span style="color:#ffd700;">???</span>
    </div>
    <div class="folder-body" style="background:#8b0000; border:1px solid #a00;">
      <span class="folder-stamp" style="color:#ffd700; border-color:#ffd700;">GİZLİ</span>
    </div>
    <div class="folder-label" style="color:#ffd700;">GİZLİ DOSYA</div>
  `;

  folderEl.addEventListener('click', () => {
    if (window.__secretFolderData) {
      openDocument(window.__secretFolderData);
    }
  });

  // Double click also works
  folderEl.addEventListener('dblclick', () => {
    if (window.__secretFolderData) {
      openDocument(window.__secretFolderData);
    }
  });

  secretInside.appendChild(folderEl);

  // Show secret compartment at desk level - user must move folders to see it
  secretComp.classList.remove('hidden');
  gsap.fromTo(secretComp,
    { opacity: 0, scale: 0.9 },
    { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
  );

  // Make secret lid draggable (user slides it to reveal folder)
  setTimeout(() => {
    secretLidDraggable = Draggable.create(secretLid, {
      type: 'x',
      bounds: { minX: -200, maxX: 0 },
      cursor: 'grab',
      activeCursor: 'grabbing',
      onDrag() {
        const progress = Math.abs(this.x) / 180;
        gsap.set(secretInside, { opacity: Math.min(progress * 1.5, 1) });
      },
      onDragEnd() {
        if (Math.abs(this.x) > 90) {
          gsap.to(secretLid, {
            x: -200, duration: 0.3, ease: 'power2.out',
            onComplete() {
              secretLid.style.display = 'none';
              makeSecretFolderDraggable();
            }
          });
          gsap.to(secretInside, { opacity: 1, duration: 0.2 });
        } else {
          gsap.to(secretLid, { x: 0, duration: 0.3, ease: 'power2.out' });
          gsap.to(secretInside, { opacity: 0, duration: 0.2 });
        }
      },
    })[0];
  }, 100);
}

function makeSecretFolderDraggable() {
  const folderEl = document.querySelector('.secret-folder');
  if (!folderEl) return;

  // Move folder from compartment to desk surface so it can be dragged freely
  const rect = folderEl.getBoundingClientRect();
  const deskEl = document.getElementById('desk-surface');

  // Reparent to desk surface, keep same size
  folderEl.style.position = 'absolute';
  folderEl.style.left = rect.left + 'px';
  folderEl.style.top = rect.top + 'px';
  folderEl.style.zIndex = getNextZ();
  folderEl.style.pointerEvents = 'auto';
  deskEl.appendChild(folderEl);

  // Make it draggable like other folders
  Draggable.create(folderEl, {
    type: 'x,y',
    bounds: '#desk-surface',
    cursor: 'grab',
    activeCursor: 'grabbing',
    onPress() {
      folderEl.style.zIndex = getNextZ();
    },
    onDragStart() {
      gsap.to(folderEl, { scale: 1.05, duration: 0.2 });
    },
    onDragEnd() {
      gsap.to(folderEl, { scale: 1, duration: 0.3, ease: 'power2.out' });
    },
  });
}
