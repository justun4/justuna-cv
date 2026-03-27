import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { getNextZ } from './desk.js';
import { playSound, stopSound } from './sounds.js';

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

  // Inner content for folded state
  newspaper.innerHTML = `
    <div class="newspaper-fold-line"></div>
    <div class="newspaper-title-peek">GAZETE</div>
  `;

  let isOpen = false;
  let isDragging = false;

  // Make folded newspaper draggable
  const draggable = Draggable.create(newspaper, {
    type: 'x,y',
    bounds: '#desk-surface',
    cursor: 'grab',
    activeCursor: 'grabbing',
    onPress() {
      newspaper.style.zIndex = getNextZ();
      isDragging = false;
    },
    onDragStart() {
      isDragging = true;
      playSound('note-shuffle');
      gsap.to(newspaper, { scale: 1.05, duration: 0.2 });
    },
    onDragEnd() {
      stopSound('note-shuffle');
      gsap.to(newspaper, { scale: 1, duration: 0.2 });
      setTimeout(() => { isDragging = false; }, 50);
    },
  })[0];

  // Click to unfold into overlay
  newspaper.addEventListener('dblclick', (e) => {
    if (isDragging || isOpen) return;
    e.stopPropagation();
    openNewspaper(newspaperData);
  });

  function openNewspaper(data) {
    isOpen = true;
    playSound('page-flip');

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'newspaper-overlay';
    overlay.style.zIndex = 200;

    const dateStr = new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
    const skillTags = data.skills.map(s => `<span class="np-skill-tag">${s}</span>`).join('');

    overlay.innerHTML = `
      <div class="newspaper-backdrop"></div>
      <div class="newspaper-full">
        <div class="np-header">
          <div class="np-masthead">SORUŞTURMA GAZETESİ</div>
          <div class="np-header-sub">
            <span>Yıl: 1 — Sayı: 42</span>
            <span>${dateStr}</span>
            <span>Fiyatı: Gizli</span>
          </div>
          <div class="np-divider thick"></div>
        </div>

        <div class="np-headline">${data.headline}</div>
        <div class="np-subtitle">${data.subtitle}</div>
        <div class="np-divider"></div>

        <div class="np-body">
          <div class="np-col-left">
            <div class="np-wanted-poster">
              <img src="/assets/images/wanted.png" alt="Şüpheli" class="np-wanted-img">
            </div>

            <div class="np-article np-left-article">
              <div class="np-article-title">BORSA</div>
              <p class="np-fake-news">Teknoloji hisseleri bu hafta %12 yükseldi. Bulut bilişim sektörü rekor büyüme kaydetti. Analistler yükselişin devam edeceğini öngörüyor.</p>
            </div>

            <div class="np-article np-left-article">
              <div class="np-article-title">İLAN</div>
              <p class="np-fake-news">Deneyimli Sistem Mühendisi aranıyor. Linux, AWS ve Kubernetes bilgisi şart. İlgilenenlerin özgeçmişlerini göndermesi rica olunur.</p>
            </div>
          </div>

          <div class="np-col-right">
            <div class="np-article">
              <div class="np-article-title">GİZEMLİ OLAY: KAHVELERİ KİM İÇİYOR?</div>
              <p class="np-fake-news">Şehir merkezindeki ofislerde son günlerde yaşanan gizemli kahve kaybı vakası büyüyor. Güvenlik kameraları her sabah saat 08:00'da doldurulan kahve makinelerinin 08:15'te tamamen boşaldığını gösteriyor. Yetkililer durumu "açıklanamaz" olarak nitelendirdi.</p>
            </div>

            <div class="np-article">
              <div class="np-article-title">HAVA DURUMU</div>
              <p class="np-fake-news">Bugün sisli ve kasvetli bir hava bekleniyor. Dedektifler için ideal çalışma koşulları. Şemsiyenizi almayı unutmayın. Gece saatlerinde gizemli ayak sesleri duyulabilir.</p>
            </div>

            <div class="np-article">
              <div class="np-article-title">TEKNOLOJİ: YENİ NESİL SUNUCULAR</div>
              <p class="np-fake-news">Devlet kurumlarında kullanılan eski sunucu sistemlerinin modernizasyonu kapsamında, bulut tabanlı altyapılara geçiş hızlanıyor. Uzmanlar, sanallaştırma teknolojilerinin veri merkezlerinde %60 enerji tasarrufu sağladığını açıkladı.</p>
            </div>

            <div class="np-article">
              <div class="np-article-title">SPOR: VOLEYBOL LİGİ BAŞLIYOR</div>
              <p class="np-fake-news">Bölge voleybol turnuvası bu hafta sonu başlıyor. Geçen yılın ikincisi olan takım, bu sezon şampiyonluk hedefliyor. Antrenör, takımın fiziksel ve mental olarak hazır olduğunu belirtti.</p>
            </div>

            <div class="np-article">
              <div class="np-article-title">KÜLTÜR: TİYATRO FESTİVALİ</div>
              <p class="np-fake-news">Şehir tiyatrosu bu sezon 12 yeni oyun sahneleyecek. Festivalde hem klasik hem modern eserler yer alacak. Biletler ön satışta tükenmek üzere.</p>
            </div>
          </div>
        </div>

        <div class="np-footer">
          <span class="np-footer-text">Bu gazete gizli bilgi içermektedir. Yetkisiz kişilerce okunması yasaktır.</span>
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
    overlay.querySelector('.newspaper-backdrop').addEventListener('click', () => {
      closeNewspaper(overlay);
    });
  }

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
