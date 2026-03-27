let audioCtx = null;
let muted = false;
const fileBuffers = {};
const muteCallbacks = [];

// File-based sounds (randomly rotated)
const fileSounds = {
  'paper-shuffle': [
    '/assets/sounds/paper-shuffle-1.wav',
    '/assets/sounds/paper-shuffle-2.wav',
    '/assets/sounds/paper-shuffle-3.wav',
  ],
};

export function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

let activeSources = {};

async function loadAndPlay(url, volume = 0.5, tag = null) {
  const ctx = getContext();
  if (!fileBuffers[url]) {
    try {
      const res = await fetch(url);
      const arr = await res.arrayBuffer();
      fileBuffers[url] = await ctx.decodeAudioData(arr);
    } catch { return; }
  }
  const source = ctx.createBufferSource();
  source.buffer = fileBuffers[url];
  const gain = ctx.createGain();
  gain.gain.value = volume;
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start(0);

  if (tag) {
    // Stop previous sound with same tag
    if (activeSources[tag]) {
      try { activeSources[tag].gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05); } catch {}
    }
    activeSources[tag] = { source, gain };
    source.onended = () => { if (activeSources[tag]?.source === source) delete activeSources[tag]; };
  }
}

export function stopSound(tag) {
  if (!activeSources[tag]) return;
  try {
    const ctx = getContext();
    activeSources[tag].gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    delete activeSources[tag];
  } catch {}
}

// Synthesized sound effects
const soundGenerators = {
  'folder-open': () => {
    loadAndPlay('/assets/sounds/folder-open.wav', 0.5);
  },

  'folder-close': () => {
    loadAndPlay('/assets/sounds/folder-close.wav', 0.5);
  },

  'page-flip': () => {
    loadAndPlay('/assets/sounds/page-flip.wav', 0.5);
  },

  'paper-shuffle': () => {
    const files = fileSounds['paper-shuffle'];
    const url = files[Math.floor(Math.random() * files.length)];
    loadAndPlay(url, 0.4, 'paper-shuffle');
  },

  'button-click': () => {
    loadAndPlay('/assets/sounds/button-click.wav', 0.5);
  },

  'slide-open': () => {
    loadAndPlay('/assets/sounds/slide-open.wav', 0.5);
  },

  'usb-insert': () => {
    const ctx = getContext();
    // Click
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1500, ctx.currentTime);
    gain1.gain.setValueAtTime(0.1, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.05);

    // Confirmation beep
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, ctx.currentTime);
      gain2.gain.setValueAtTime(0.08, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.15);
    }, 100);
  },

  'access-granted': () => {
    const ctx = getContext();
    // Three ascending beeps
    [440, 554, 660].forEach((freq, i) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }, i * 120);
    });
  },

  'sip-coffee': () => {
    const files = ['/assets/sounds/sip-coffee-1.mp3', '/assets/sounds/sip-coffee-2.mp3'];
    const url = files[Math.floor(Math.random() * files.length)];
    loadAndPlay(url, 0.5);
  },

  'coffee-pour': () => {
    loadAndPlay('/assets/sounds/coffee-pour.wav', 0.5, 'coffee-pour');
  },

  'desk-object': () => {
    loadAndPlay('/assets/sounds/desk-object.wav', 0.4, 'desk-object');
  },

  'note-shuffle': () => {
    loadAndPlay('/assets/sounds/note-shuffle.wav', 0.4, 'note-shuffle');
  },

  'terminal-type': () => {
    loadAndPlay('/assets/sounds/terminal-type.wav', 0.4, 'terminal-type');
  },

  'drag-start': () => {
    playNoise(0.04, 0.08);
  },

  'fingerprint-scan': () => {
    const ctx = getContext();
    [600, 800, 1000].forEach((freq, i) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }, i * 80);
    });
  },

  'cipher-click': () => {
    const ctx = getContext();
    const bufferSize = ctx.sampleRate * 0.04;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.Q.setValueAtTime(2, ctx.currentTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    source.stop(ctx.currentTime + 0.04);
  },

  'radio-static': () => {
    const ctx = getContext();
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    source.stop(ctx.currentTime + 0.15);
  },

  'pin-stick': () => {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(3000, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  },

  'note-crumple': () => {
    const ctx = getContext();
    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    source.stop(ctx.currentTime + 0.2);
  },
};

// Generate filtered noise (paper/friction sound)
function playNoise(volume, duration) {
  const ctx = getContext();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  // Bandpass filter for paper-like sound
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(3000, ctx.currentTime);
  filter.Q.setValueAtTime(0.5, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
  source.stop(ctx.currentTime + duration);
}

export function playSound(name) {
  if (muted) return;
  const generator = soundGenerators[name];
  if (generator) {
    try { generator(); } catch {}
  }
}

export function onMuteChange(cb) { muteCallbacks.push(cb); }

export function toggleMute() {
  muted = !muted;
  muteCallbacks.forEach(cb => cb(muted));
  return muted;
}

export function isMuted() {
  return muted;
}

export function initSounds() {
  const saved = localStorage.getItem('detective-desk-muted');
  if (saved === 'true') muted = true;

  const btn = document.getElementById('sound-toggle');
  if (btn) {
    updateMuteUI(btn);
    btn.addEventListener('click', () => {
      toggleMute();
      localStorage.setItem('detective-desk-muted', muted);
      updateMuteUI(btn);
      // Play a test sound on unmute
      if (!muted) playSound('button-click');
    });
  }

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
