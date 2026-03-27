import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { getNextZ } from './desk.js';
import { playSound, stopSound, isMuted, getContext, onMuteChange } from './sounds.js';

gsap.registerPlugin(Draggable);

let radioPlaying = false;
let radioNodes = null;
let audioBuffer = null;
let currentVolume = 0.2;
let radioElRef = null;

export function initRadio() {
  const desk = document.getElementById('desk-surface');
  if (!desk) return;

  // Create radio element
  const radio = document.createElement('div');
  radio.className = 'desk-radio';
  radio.style.left = '75%';
  radio.style.top = '3%';
  desk.appendChild(radio);
  radioElRef = radio;

  radio.innerHTML = `
    <div class="radio-speaker"></div>
    <div class="radio-controls">
      <button class="radio-vol-btn radio-vol-up">+</button>
      <span class="radio-vol-display">20%</span>
      <button class="radio-vol-btn radio-vol-down">−</button>
    </div>
    <div class="radio-antenna"></div>
    <div class="radio-led"></div>
  `;

  let isDragging = false;

  // Make draggable
  Draggable.create(radio, {
    type: 'x,y',
    bounds: '#desk-surface',
    cursor: 'grab',
    activeCursor: 'grabbing',
    onPress() {
      radio.style.zIndex = getNextZ();
      isDragging = false;
    },
    onDragStart() {
      isDragging = true;
      playSound('desk-object');
      gsap.to(radio, { scale: 1.05, duration: 0.2 });
    },
    onDragEnd() {
      stopSound('desk-object');
      gsap.to(radio, { scale: 1, duration: 0.2 });
      setTimeout(() => { isDragging = false; }, 50);
    },
  });

  // Volume +/- buttons
  const volDown = radio.querySelector('.radio-vol-down');
  const volUp = radio.querySelector('.radio-vol-up');
  const volDisplay = radio.querySelector('.radio-vol-display');

  function updateVolumeDisplay() {
    volDisplay.textContent = `${Math.round(currentVolume * 100)}%`;
  }

  volDown.addEventListener('click', (e) => {
    e.stopPropagation();
    currentVolume = Math.max(0, currentVolume - 0.1);
    updateVolumeDisplay();
    if (radioNodes && radioNodes.gainNode) {
      radioNodes.gainNode.gain.setValueAtTime(currentVolume, radioNodes.ctx.currentTime);
    }
  });

  volUp.addEventListener('click', (e) => {
    e.stopPropagation();
    currentVolume = Math.min(1, currentVolume + 0.1);
    updateVolumeDisplay();
    if (radioNodes && radioNodes.gainNode) {
      radioNodes.gainNode.gain.setValueAtTime(currentVolume, radioNodes.ctx.currentTime);
    }
  });

  // Click to toggle radio
  radio.addEventListener('click', (e) => {
    if (isDragging) return;
    e.stopPropagation();
    toggleRadio(radio);
  });

  // Stop radio when global mute is toggled on
  onMuteChange((isMuted) => {
    if (isMuted && radioPlaying) {
      stopRadio();
      const led = radio.querySelector('.radio-led');
      led.classList.remove('on');
      radio.classList.remove('playing');
      radioPlaying = false;
    }
  });

  // Pre-fetch audio buffer
  prefetchAudio();
}

async function prefetchAudio() {
  try {
    const response = await fetch('/assets/sounds/radio-song.mp3');
    const arrayBuffer = await response.arrayBuffer();
    const ctx = getContext();
    audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  } catch (err) {
    console.warn('Radio: failed to prefetch audio', err);
  }
}

function toggleRadio(radioEl) {
  const led = radioEl.querySelector('.radio-led');

  if (radioPlaying) {
    // Turn off
    stopRadio();
    led.classList.remove('on');
    radioEl.classList.remove('playing');
    playSound('radio-static');
  } else {
    // Turn on
    if (isMuted()) return;
    startRadio();
    led.classList.add('on');
    radioEl.classList.add('playing');
    playSound('radio-static');
  }
  radioPlaying = !radioPlaying;
}

async function startRadio() {
  const ctx = getContext();

  // Ensure audio buffer is loaded
  if (!audioBuffer) {
    try {
      const response = await fetch('/assets/sounds/radio-song.mp3');
      const arrayBuffer = await response.arrayBuffer();
      audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    } catch (err) {
      console.warn('Radio: failed to load audio', err);
      return;
    }
  }

  // Create buffer source for the MP3
  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;

  // Gain node for volume control
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(currentVolume, ctx.currentTime + 0.3);

  source.connect(gainNode);
  gainNode.connect(ctx.destination);

  source.start();

  // Auto-stop when song ends
  source.onended = () => {
    if (radioPlaying && radioElRef) {
      radioPlaying = false;
      const led = radioElRef.querySelector('.radio-led');
      if (led) led.classList.remove('on');
      radioElRef.classList.remove('playing');
      radioNodes = null;
      playSound('radio-static');
    }
  };

  radioNodes = { source, gainNode, ctx };
}

function stopRadio() {
  if (!radioNodes) return;
  const { source, gainNode, ctx } = radioNodes;

  gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);

  setTimeout(() => {
    try { source.stop(); } catch {}
  }, 350);

  radioNodes = null;
}
