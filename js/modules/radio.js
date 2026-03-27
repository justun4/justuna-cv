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

  const radio = document.createElement('div');
  radio.className = 'desk-radio';
  radio.style.left = '75%';
  radio.style.top = '3%';
  desk.appendChild(radio);
  radioElRef = radio;

  radio.innerHTML = `
    <span class="radio-vol-display">20%</span>
    <div class="radio-led"></div>
  `;

  const volDisplay = radio.querySelector('.radio-vol-display');

  function updateVolumeDisplay() {
    volDisplay.textContent = `${Math.round(currentVolume * 100)}%`;
  }

  // Single GSAP Draggable with onClick - determine action by click position
  Draggable.create(radio, {
    type: 'x,y',
    bounds: '#desk-surface',
    cursor: 'grab',
    activeCursor: 'grabbing',
    minimumMovement: 3,
    onPress() {
      radio.style.zIndex = getNextZ();
    },
    onClick(e) {
      // Determine which area was clicked based on position within radio
      const rect = radio.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width; // 0-1
      const relY = (e.clientY - rect.top) / rect.height; // 0-1

      if (relX > 0.55 && relY > 0.65) {
        // Bottom-right: ON/OFF
        toggleRadio(radio);
      } else if (relX > 0.55 && relX < 0.72 && relY < 0.55) {
        // Middle-right top: Volume DOWN
        currentVolume = Math.max(0, Math.round((currentVolume - 0.1) * 10) / 10);
        updateVolumeDisplay();
        if (radioNodes && radioNodes.gainNode) {
          radioNodes.gainNode.gain.setValueAtTime(currentVolume, radioNodes.ctx.currentTime);
        }
      } else if (relX > 0.72 && relY < 0.55) {
        // Far-right top: Volume UP
        currentVolume = Math.min(1, Math.round((currentVolume + 0.1) * 10) / 10);
        updateVolumeDisplay();
        if (radioNodes && radioNodes.gainNode) {
          radioNodes.gainNode.gain.setValueAtTime(currentVolume, radioNodes.ctx.currentTime);
        }
      }
      // Clicking on speaker area (left side) does nothing
    },
    onDragStart() {
      playSound('desk-object');
      gsap.to(radio, { scale: 1.05, duration: 0.2 });
    },
    onDragEnd() {
      stopSound('desk-object');
      gsap.to(radio, { scale: 1, duration: 0.2 });
    },
  });

  // Global mute
  onMuteChange((muted) => {
    if (muted && radioPlaying) {
      stopRadio();
      radio.querySelector('.radio-led').classList.remove('on');
      radio.classList.remove('playing');
      radioPlaying = false;
    }
  });

  prefetchAudio();
}

async function prefetchAudio() {
  try {
    const response = await fetch('/assets/sounds/radio-song.mp3');
    const arrayBuffer = await response.arrayBuffer();
    const ctx = getContext();
    audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  } catch {}
}

function toggleRadio(radioEl) {
  const led = radioEl.querySelector('.radio-led');

  if (radioPlaying) {
    stopRadio();
    led.classList.remove('on');
    radioEl.classList.remove('playing');
    playSound('radio-static');
  } else {
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

  if (!audioBuffer) {
    try {
      const response = await fetch('/assets/sounds/radio-song.mp3');
      const arrayBuffer = await response.arrayBuffer();
      audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    } catch { return; }
  }

  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(currentVolume, ctx.currentTime + 0.3);

  source.connect(gainNode);
  gainNode.connect(ctx.destination);
  source.start();

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
