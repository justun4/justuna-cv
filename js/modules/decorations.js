const container = document.getElementById('decorations-container');

export function initDecorations(decorData) {
  // Coffee stain (decorative only - the interactive mug is in HTML)
  createCoffeeStain(45, 72);

  // Desk pen (decorative - the interactive USB replaced the puzzle pen)
  createPen(30, 85, 35);

  // Paper clips
  createPaperClip(30, 5, 15);
  createPaperClip(92, 35, -20);
  createPaperClip(5, 55, 45);

  // Sticky notes from data
  if (decorData && decorData.stickyNotes) {
    decorData.stickyNotes.forEach(note => {
      createStickyNote(note.text, note.position.x, note.position.y, note.color, note.rotation);
    });
  }
}

function createCoffeeStain(x, y) {
  const stain = document.createElement('div');
  stain.className = 'coffee-stain';
  stain.style.left = `${x}%`;
  stain.style.top = `${y}%`;
  container.appendChild(stain);
}

function createPen(x, y, rotation) {
  const pen = document.createElement('div');
  pen.className = 'desk-pen';
  pen.style.left = `${x}%`;
  pen.style.top = `${y}%`;
  pen.style.transform = `rotate(${rotation}deg)`;
  container.appendChild(pen);
}

function createPaperClip(x, y, rotation) {
  const clip = document.createElement('div');
  clip.className = 'paper-clip';
  clip.style.left = `${x}%`;
  clip.style.top = `${y}%`;
  clip.style.transform = `rotate(${rotation}deg)`;
  container.appendChild(clip);
}

function createStickyNote(text, x, y, color, rotation = 0) {
  const note = document.createElement('div');
  note.className = 'sticky-note';
  note.style.left = `${x}%`;
  note.style.top = `${y}%`;
  note.style.backgroundColor = color;
  note.style.transform = `rotate(${rotation}deg)`;
  note.textContent = text;
  container.appendChild(note);
}
