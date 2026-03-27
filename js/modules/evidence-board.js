import { gsap } from 'gsap';
import { getNextZ } from './desk.js';
import { playSound } from './sounds.js';
import { t, tData, onLangChange } from './i18n.js';

export function initEvidenceBoard(boardData) {
  if (!boardData) return;

  const desk = document.getElementById('desk-surface');
  if (!desk) return;

  // Create small cork-board trigger at top of desk
  const trigger = document.createElement('div');
  trigger.className = 'evidence-trigger';
  trigger.style.left = '50%';
  trigger.style.top = '2%';
  trigger.innerHTML = `
    <div class="evidence-trigger-pin"></div>
    <div class="evidence-trigger-label">${t('eb.title')}</div>
  `;
  desk.appendChild(trigger);

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    openEvidenceBoard(boardData);
  });

  // Update trigger label + close overlay on language change
  onLangChange(() => {
    const label = trigger.querySelector('.evidence-trigger-label');
    if (label) label.textContent = t('eb.title');
    const overlay = document.querySelector('.evidence-overlay');
    if (overlay) overlay.remove();
  });
}

function openEvidenceBoard(data) {
  playSound('pin-stick');


  const overlay = document.createElement('div');
  overlay.className = 'evidence-overlay';
  overlay.style.zIndex = 200;

  overlay.innerHTML = `
    <div class="eb-backdrop"></div>
    <div class="eb-board">
      <button class="overlay-close-btn" aria-label="Close">&times;</button>
      <div class="eb-title">${t('eb.title')}</div>
      <div class="eb-cork">
        <svg class="eb-strings" width="100%" height="100%"></svg>
        <div class="eb-nodes"></div>
      </div>
      <div class="eb-tooltip hidden"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  const nodesContainer = overlay.querySelector('.eb-nodes');
  const svg = overlay.querySelector('.eb-strings');
  const tooltip = overlay.querySelector('.eb-tooltip');

  // Create node elements
  const nodeMap = {};
  data.nodes.forEach(node => {
    const el = document.createElement('div');
    el.className = `eb-node eb-node-${node.type}`;
    el.style.left = `${node.x}%`;
    el.style.top = `${node.y}%`;
    el.dataset.id = node.id;

    const labelText = tData(node.label, node.label_en).replace(/\\n/g, '\n');
    el.innerHTML = `
      <div class="eb-pin"></div>
      <div class="eb-node-content">${labelText.replace(/\n/g, '<br>')}</div>
    `;

    nodesContainer.appendChild(el);
    nodeMap[node.id] = { el, data: node };

    // Click for tooltip
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      playSound('pin-stick');
      showTooltip(tooltip, node, el);
    });
  });

  // Draw connections after overlay animation completes
  setTimeout(() => {
    drawConnections(svg, data.connections, nodeMap, overlay.querySelector('.eb-cork'));
  }, 500);

  // Animate in
  gsap.fromTo(overlay.querySelector('.eb-board'),
    { scale: 0.8, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.1)' }
  );

  function closeBoard() {
    overlay.remove();
  }

  // Close
  overlay.querySelector('.eb-backdrop').addEventListener('pointerup', () => {
    closeBoard();
  });

  // Close on X button
  overlay.querySelector('.overlay-close-btn').addEventListener('pointerup', (e) => {
    e.stopPropagation();
    closeBoard();
  });

  // Close tooltip on board click
  overlay.querySelector('.eb-cork').addEventListener('click', () => {
    tooltip.classList.add('hidden');
  });
}

function drawConnections(svg, connections, nodeMap, cork) {
  const corkRect = cork.getBoundingClientRect();
  const ns = 'http://www.w3.org/2000/svg';

  connections.forEach((conn, index) => {
    const fromNode = nodeMap[conn.from];
    const toNode = nodeMap[conn.to];
    if (!fromNode || !toNode) return;

    const fromPin = fromNode.el.querySelector('.eb-pin');
    const toPin = toNode.el.querySelector('.eb-pin');
    const fromRect = fromPin.getBoundingClientRect();
    const toRect = toPin.getBoundingClientRect();

    const x1 = fromRect.left + fromRect.width / 2 - corkRect.left;
    const y1 = fromRect.top + fromRect.height / 2 - corkRect.top;
    const x2 = toRect.left + toRect.width / 2 - corkRect.left;
    const y2 = toRect.top + toRect.height / 2 - corkRect.top;

    // Slight natural droop in the string
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2 + 20;

    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`);
    path.setAttribute('class', 'eb-string');

    // Calculate path length for animation
    svg.appendChild(path);
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;

    // Animate string drawing
    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 0.8,
      delay: index * 0.15,
      ease: 'power2.out',
    });
  });
}

function showTooltip(tooltip, node, el) {
  const labelText = tData(node.label, node.label_en).replace(/\\n/g, '\n');
  const typeLabels = {
    photo: t('eb.type.suspect'),
    skill: t('eb.type.skill'),
    job: t('eb.type.job'),
    edu: t('eb.type.edu'),
  };

  tooltip.innerHTML = `
    <div class="eb-tooltip-type">${typeLabels[node.type] || node.type}</div>
    <div class="eb-tooltip-label">${labelText.replace(/\n/g, ' - ')}</div>
    ${node.desc ? `<div class="eb-tooltip-desc">${tData(node.desc, node.desc_en)}</div>` : ''}
  `;
  tooltip.classList.remove('hidden');

  // Position near node
  const rect = el.getBoundingClientRect();
  const board = el.closest('.eb-board').getBoundingClientRect();
  tooltip.style.left = `${rect.left - board.left + rect.width / 2}px`;
  tooltip.style.top = `${rect.top - board.top - 50}px`;

  gsap.fromTo(tooltip, { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.2 });
}
