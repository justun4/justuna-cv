import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { getNextZ } from './desk.js';
import { playSound, stopSound, isMuted, getContext, onMuteChange } from './sounds.js';

gsap.registerPlugin(Draggable);

function addTapHandler(el, callback) {
  let sx = 0, sy = 0;
  el.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; });
  el.addEventListener('pointerup', (e) => {
    if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) < 15) {
      e.stopPropagation();
      callback();
    }
  });
}

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
    <div class="radio-hitzone radio-hitzone-power" title="ON/OFF"></div>
    <div class="radio-hitzone radio-hitzone-vol-down" title="Volume -"></div>
    <div class="radio-hitzone radio-hitzone-vol-up" title="Volume +"></div>
    <span class="radio-vol-display">20%</span>
    <div class="radio-led"></div>
  `;

  let isDragging = false;
  const volDisplay = radio.querySelector('.radio-vol-display');

  function updateVolumeDisplay() {
    volDisplay.textContent = `${Math.round(currentVolume * 100)}%`;
  }

  // Draggable
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

  // ON-OFF button
  addTapHandler(radio.querySelector('.radio-hitzone-power'), () => {
    toggleRadio(radio);
  });

  // Volume DOWN (left side of dial)
  addTapHandler(radio.querySelector('.radio-hitzone-vol-down'), () => {
    currentVolume = Math.max(0, Math.round((currentVolume - 0.1) * 10) / 10);
    updateVolumeDisplay();
    if (radioNodes && radioNodes.gainNode) {
      radioNodes.gainNode.gain.setValueAtTime(currentVolume, radioNodes.ctx.currentTime);
    }
  });

  // Volume UP (right side of dial)
  addTapHandler(radio.querySelector('.radio-hitzone-vol-up'), () => {
    currentVolume = Math.min(1, Math.round((currentVolume + 0.1) * 10) / 10);
    updateVolumeDisplay();
    if (radioNodes && radioNodes.gainNode) {
      radioNodes.gainNode.gain.setValueAtTime(currentVolume, radioNodes.ctx.currentTime);
    }
  });

  // Prevent radio body click from toggling (only power button toggles)
  radio.addEventListener('click', (e) => {
    e.stopPropagation();
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
