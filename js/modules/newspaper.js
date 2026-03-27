import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { getNextZ } from './desk.js';
import { playSound, stopSound } from './sounds.js';
import { t, tData, getLang, onLangChange } from './i18n.js';

gsap.registerPlugin(Draggable);

export function initNewspaper(newspaperData) {
  if (!newspaperData) return;

  const desk = document.getElementById('desk-surface');
  if (!desk) return;

  // Create folded newspaper on desk
  const newspaper = document.createElement('div');
  newspaper.className = 'newspaper-folded';
  newspaper.style.left = '70%';
  newspaper.style.top = '80%';
  desk.appendChild(newspaper);

  // PNG image replaces folded state visuals (no inner HTML needed)

  let isOpen = false;
  let isDragging = false;

  // Make folded newspaper draggable
  Draggable.create(newspaper, {
    type: 'x,y',
    bounds: '#desk-surface',
    cursor: 'grab',
    activeCursor: 'grabbing',
    minimumMovement: 3,
    onPress() {
      newspaper.style.zIndex = getNextZ();
    },
    onClick() {
      if (!isOpen) openNewspaper(newspaperData);
    },
    onDragStart() {
      playSound('note-shuffle');
      gsap.to(newspaper, { scale: 1.05, duration: 0.2 });
    },
    onDragEnd() {
      stopSound('note-shuffle');
      gsap.to(newspaper, { scale: 1, duration: 0.2 });
    },
  });

  function openNewspaper(data) {
    isOpen = true;
    playSound('page-flip');


    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'newspaper-overlay';
    overlay.style.zIndex = 200;

    const locale = getLang() === 'en' ? 'en-US' : 'tr-TR';
    const dateStr = new Date().toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    const skillTags = data.skills.map(s => `<span class="np-skill-tag">${s}</span>`).join('');

    overlay.innerHTML = `
      <div class="newspaper-backdrop"></div>
      <div class="newspaper-full">
        <button class="overlay-close-btn" aria-label="Close">&times;</button>
        <div class="np-header">
          <div class="np-masthead">${t('news.masthead')}</div>
          <div class="np-header-sub">
            <span>${t('news.year')}</span>
            <span>${dateStr}</span>
            <span>${t('news.price')}</span>
          </div>
          <div class="np-divider thick"></div>
        </div>

        <div class="np-headline">${tData(data.headline, data.headline_en)}</div>
        <div class="np-subtitle">${tData(data.subtitle, data.subtitle_en)}</div>
        <div class="np-divider"></div>

        <div class="np-body">
          <div class="np-col-left">
            <div class="np-wanted-poster">
              <img src="/assets/images/wanted.png" alt="${t('eb.type.suspect')}" class="np-wanted-img">
            </div>

            <div class="np-article np-left-article">
              <div class="np-article-title">${t('news.left1.title')}</div>
              <p class="np-fake-news">${t('news.left1.text')}</p>
            </div>

            <div class="np-article np-left-article">
              <div class="np-article-title">${t('news.left2.title')}</div>
              <p class="np-fake-news">${t('news.left2.text')}</p>
            </div>
          </div>

          <div class="np-col-right">
            <div class="np-article">
              <div class="np-article-title">${t('news.article1.title')}</div>
              <p class="np-fake-news">${t('news.article1.text')}</p>
            </div>

            <div class="np-article">
              <div class="np-article-title">${t('news.article2.title')}</div>
              <p class="np-fake-news">${t('news.article2.text')}</p>
            </div>

            <div class="np-article">
              <div class="np-article-title">${t('news.article3.title')}</div>
              <p class="np-fake-news">${t('news.article3.text')}</p>
            </div>

            <div class="np-article">
              <div class="np-article-title">${t('news.article4.title')}</div>
              <p class="np-fake-news">${t('news.article4.text')}</p>
            </div>

            <div class="np-article">
              <div class="np-article-title">${t('news.article5.title')}</div>
              <p class="np-fake-news">${t('news.article5.text')}</p>
            </div>
          </div>
        </div>

        <div class="np-footer">
          <span class="np-footer-text">${t('news.footer')}</span>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Animate in
    const full = overlay.querySelector('.newspaper-full');
    gsap.fromTo(full,
      { scale: 0.3, rotation: -5, opacity: 0 },
      { scale: 1, rotation: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.2)' }
    );
    gsap.fromTo(overlay.querySelector('.newspaper-backdrop'),
      { opacity: 0 },
      { opacity: 1, duration: 0.3 }
    );

    // Close on backdrop click
    overlay.querySelector('.newspaper-backdrop').addEventListener('pointerup', () => {
      closeNewspaper(overlay);
    });

    // Close on X button
    overlay.querySelector('.overlay-close-btn').addEventListener('pointerup', (e) => {
      e.stopPropagation();
      closeNewspaper(overlay);
    });
  }

  // Close newspaper on language change
  onLangChange(() => {
    if (isOpen) {
      const overlay = document.querySelector('.newspaper-overlay');
      if (overlay) {
        overlay.remove();
        isOpen = false;
      }
    }
  });

  function closeNewspaper(overlay) {
    const full = overlay.querySelector('.newspaper-full');
    playSound('page-flip');
    gsap.to(full, {
      scale: 0.3, rotation: 5, opacity: 0, duration: 0.3, ease: 'power2.in',
    });
    gsap.to(overlay.querySelector('.newspaper-backdrop'), {
      opacity: 0, duration: 0.3,
      onComplete() {
        overlay.remove();
        isOpen = false;
      }
    });
  }
}
