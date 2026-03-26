let audioCtx = null;
let muted = false;
const buffers = {};
const SOUNDS = {
  'folder-open': '/assets/sounds/folder-open.mp3',
  'folder-close': '/assets/sounds/folder-close.mp3',
  'page-flip': '/assets/sounds/page-flip.mp3',
  'paper-shuffle': '/assets/sounds/paper-shuffle.mp3',
};

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

async function loadSound(name) {
  if (buffers[name]) return buffers[name];
  const url = SOUNDS[name];
  if (!url) return null;

  try {
    const ctx = getContext();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    buffers[name] = audioBuffer;
    return audioBuffer;
  } catch {
    // Sound file not available - silent fail
    return null;
  }
}

export async function playSound(name) {
  if (muted) return;
  const buffer = await loadSound(name);
  if (!buffer) return;

  const ctx = getContext();
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.value = 0.4;

  source.connect(gain);
  gain.connect(ctx.destination);
  source.start(0);
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}

export function initSounds() {
  // Check localStorage for mute preference
  const saved = localStorage.getItem('detective-desk-muted');
  if (saved === 'true') muted = true;

  const btn = document.getElementById('sound-toggle');
  if (btn) {
    updateMuteUI(btn);
    btn.addEventListener('click', () => {
      toggleMute();
      localStorage.setItem('detective-desk-muted', muted);
      updateMuteUI(btn);
    });
  }

  // Initialize audio context on first user interaction
  const initAudio = () => {
    getContext();
    document.removeEventListener('click', initAudio);
    document.removeEventListener('touchstart', initAudio);
  };
  document.addEventListener('click', initAudio);
  document.addEventListener('touchstart', initAudio);
}

function updateMuteUI(btn) {
  const on = btn.querySelector('.sound-on');
  const off = btn.querySelector('.sound-off');
  if (muted) {
    on.classList.add('hidden');
    off.classList.remove('hidden');
  } else {
    on.classList.remove('hidden');
    off.classList.add('hidden');
  }
}
