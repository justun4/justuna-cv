/**
 * i18n Module - Internationalization for Detective Desk CV
 * Supports English (en) and Turkish (tr)
 */

const STORAGE_KEY = 'detective-desk-lang';
let currentLang = 'en';
let listeners = [];

const translations = {
  // INTRO
  'intro.title': { tr: 'DOSYA \u0130NCELEME MASASI', en: 'CASE FILE INVESTIGATION DESK' },
  'intro.subtitle': { tr: '\u015E\u00FCpheli: Tunahan H\u00DCSEM', en: 'Suspect: Tunahan H\u00DCSEM' },
  'intro.hint': { tr: 'Masadaki dosyalar\u0131 a\u00E7arak soru\u015Fturmaya ba\u015Flay\u0131n', en: 'Open the files on the desk to start the investigation' },
  'intro.start': { tr: 'SORU\u015ETURMAYI BA\u015ELAT', en: 'START INVESTIGATION' },

  // TERMINAL
  'terminal.scan': { tr: '$ sistem_tarama --ba\u015Flat', en: '$ system_scan --start' },
  'terminal.detected': { tr: '> Cihaz alg\u0131land\u0131...', en: '> Device detected...' },
  'terminal.auth': { tr: '> Yetkilendirme gerekli.', en: '> Authorization required.' },
  'terminal.waiting': { tr: '> USB anahtar bekleniyor...', en: '> Waiting for USB key...' },
  'terminal.verified': { tr: '> USB do\u011Fruland\u0131.', en: '> USB verified.' },
  'terminal.identity': { tr: '> Kimlik: TUNAHAN H\u00DCSEM', en: '> Identity: TUNAHAN H\u00DCSEM' },
  'terminal.access': { tr: '> Yetki seviyesi: TAM ER\u0130\u015E\u0130M', en: '> Authorization level: FULL ACCESS' },
  'terminal.unlock': { tr: '> Gizli dosya kilidi a\u00E7\u0131l\u0131yor...', en: '> Unlocking secret file...' },
  'terminal.pending': { tr: 'ER\u0130\u015E\u0130M BEKLEN\u0130YOR...', en: 'ACCESS PENDING...' },
  'terminal.granted': { tr: 'ER\u0130\u015E\u0130M SA\u011ELANDI', en: 'ACCESS GRANTED' },

  // DOCUMENT VIEWER
  'doc.close': { tr: 'Kapat', en: 'Close' },
  'doc.prev': { tr: '\u00AB \u00D6nceki', en: '\u00AB Previous' },
  'doc.next': { tr: 'Sonraki \u00BB', en: 'Next \u00BB' },
  'doc.page': { tr: 'Sayfa', en: 'Page' },
  'doc.stamp.high': { tr: 'G\u0130ZL\u0130L\u0130K: Y\u00DCKSEK', en: 'CONFIDENTIALITY: HIGH' },
  'doc.stamp.classified': { tr: 'SINIFLANDIRILMI\u015E', en: 'CLASSIFIED' },
  'doc.unknown': { tr: 'Bilinmeyen dosya format\u0131.', en: 'Unknown file format.' },
  'doc.section.profile': { tr: 'Profil', en: 'Profile' },
  'doc.section.languages': { tr: 'Diller', en: 'Languages' },
  'doc.section.activities': { tr: 'Aktiviteler', en: 'Activities' },
  'doc.section.contact': { tr: '\u0130leti\u015Fim', en: 'Contact' },
  'doc.section.references': { tr: 'Referanslar', en: 'References' },
  'doc.label.email': { tr: 'E-POSTA', en: 'EMAIL' },
  'doc.label.phone': { tr: 'TELEFON', en: 'PHONE' },
  'doc.label.name': { tr: '\u0130S\u0130M', en: 'NAME' },
  'doc.label.title': { tr: '\u00DCNVAN', en: 'TITLE' },
  'doc.secret.warning': { tr: '\u26A0 G\u0130ZL\u0130 B\u0130LG\u0130 \u2014 SADECE YETK\u0130L\u0130 PERSONEL \u26A0', en: '\u26A0 CLASSIFIED \u2014 AUTHORIZED PERSONNEL ONLY \u26A0' },

  // FOLDERS
  'folder.stamps': { tr: ['AKT\u0130F', '\u0130NCELE', '\u00D6NEML\u0130', 'KAYIT', 'DOSYA'], en: ['ACTIVE', 'REVIEW', 'IMPORTANT', 'RECORD', 'FILE'] },
  'folder.secret': { tr: 'G\u0130ZL\u0130', en: 'SECRET' },
  'folder.secretFile': { tr: 'G\u0130ZL\u0130 DOSYA', en: 'SECRET FILE' },

  // NEWSPAPER
  'news.peek': { tr: 'GAZETE', en: 'NEWSPAPER' },
  'news.masthead': { tr: 'SORU\u015ETURMA GAZETES\u0130', en: 'INVESTIGATION GAZETTE' },
  'news.year': { tr: 'Y\u0131l: 1 \u2014 Say\u0131: 42', en: 'Year: 1 \u2014 Issue: 42' },
  'news.price': { tr: 'Fiyat\u0131: Gizli', en: 'Price: Classified' },
  'news.footer': { tr: 'Bu gazete gizli bilgi i\u00E7ermektedir. Yetkisiz ki\u015Filerce okunmas\u0131 yasakt\u0131r.', en: 'This newspaper contains classified information. Unauthorized reading is prohibited.' },
  'news.article1.title': { tr: 'G\u0130ZEML\u0130 OLAY: KAHVELER\u0130 K\u0130M \u0130\u00C7\u0130YOR?', en: 'MYSTERY: WHO IS DRINKING THE COFFEES?' },
  'news.article1.text': { tr: '\u015Eehir merkezindeki ofislerde son g\u00FCnlerde ya\u015Fanan gizemli kahve kayb\u0131 vakas\u0131 b\u00FCy\u00FCyor. G\u00FCvenlik kameralar\u0131 her sabah saat 08:00\'da doldurulan kahve makinelerinin 08:15\'te tamamen bo\u015Fald\u0131\u011F\u0131n\u0131 g\u00F6steriyor. Yetkililer durumu "a\u00E7\u0131klanamaz" olarak nitelendirdi.', en: 'The mysterious coffee disappearance in downtown offices is growing. Security cameras show coffee machines filled at 08:00 completely emptied by 08:15. Authorities describe the situation as "inexplicable."' },
  'news.article2.title': { tr: 'HAVA DURUMU', en: 'WEATHER' },
  'news.article2.text': { tr: 'Bug\u00FCn sisli ve kasvetli bir hava bekleniyor. Dedektifler i\u00E7in ideal \u00E7al\u0131\u015Fma ko\u015Fullar\u0131. \u015Eemsiyenizi almay\u0131 unutmay\u0131n. Gece saatlerinde gizemli ayak sesleri duyulabilir.', en: 'Foggy and gloomy weather expected today. Ideal conditions for detectives. Don\'t forget your umbrella. Mysterious footsteps may be heard at night.' },
  'news.article3.title': { tr: 'TEKNOLOJ\u0130: YEN\u0130 NES\u0130L SUNUCULAR', en: 'TECHNOLOGY: NEXT-GEN SERVERS' },
  'news.article3.text': { tr: 'Devlet kurumlar\u0131nda kullan\u0131lan eski sunucu sistemlerinin modernizasyonu kapsam\u0131nda, bulut tabanl\u0131 altyap\u0131lara ge\u00E7i\u015F h\u0131zlan\u0131yor. Uzmanlar, sanalla\u015Ft\u0131rma teknolojilerinin veri merkezlerinde %60 enerji tasarrufu sa\u011Flad\u0131\u011F\u0131n\u0131 a\u00E7\u0131klad\u0131.', en: 'As part of modernizing old government server systems, the transition to cloud-based infrastructure is accelerating. Experts report 60% energy savings with virtualization technologies.' },
  'news.article4.title': { tr: 'SPOR: VOLEYBOL L\u0130G\u0130 BA\u015ELIHOR', en: 'SPORTS: VOLLEYBALL LEAGUE STARTS' },
  'news.article4.text': { tr: 'B\u00F6lge voleybol turnuvas\u0131 bu hafta sonu ba\u015Fl\u0131yor. Ge\u00E7en y\u0131l\u0131n ikincisi olan tak\u0131m, bu sezon \u015Fampiyonluk hedefliyor. Antren\u00F6r, tak\u0131m\u0131n fiziksel ve mental olarak haz\u0131r oldu\u011Funu belirtti.', en: 'The regional volleyball tournament starts this weekend. Last year\'s runner-up aims for championship. The coach confirmed the team is ready.' },
  'news.article5.title': { tr: 'K\u00DCLT\u00DCR: T\u0130YATRO FEST\u0130VAL\u0130', en: 'CULTURE: THEATER FESTIVAL' },
  'news.article5.text': { tr: '\u015Eehir tiyatrosu bu sezon 12 yeni oyun sahneleyecek. Festivalde hem klasik hem modern eserler yer alacak. Biletler \u00F6n sat\u0131\u015Fta t\u00FCkenmek \u00FCzere.', en: 'The city theater will stage 12 new plays. Both classical and modern works featured. Advance tickets almost sold out.' },
  'news.left1.title': { tr: 'BORSA', en: 'STOCK MARKET' },
  'news.left1.text': { tr: 'Teknoloji hisseleri bu hafta %12 y\u00FCkseldi. Bulut bili\u015Fim sekt\u00F6r\u00FC rekor b\u00FCy\u00FCme kaydetti. Analistler y\u00FCkseli\u015Fin devam edece\u011Fini \u00F6ng\u00F6r\u00FCyor.', en: 'Tech stocks rose 12% this week. Cloud computing sector recorded record growth. Analysts predict continued rise.' },
  'news.left2.title': { tr: '\u0130LAN', en: 'LISTING' },
  'news.left2.text': { tr: 'Deneyimli Sistem M\u00FChendisi aran\u0131yor. Linux, AWS ve Kubernetes bilgisi \u015Fart. \u0130lgilenenlerin \u00F6zge\u00E7mi\u015Flerini g\u00F6ndermesi rica olunur.', en: 'Experienced Systems Engineer wanted. Linux, AWS and Kubernetes required. Interested parties please submit CVs.' },

  // CIPHER
  'cipher.title': { tr: 'SEZAR \u015E\u0130FRE C\u0130HAZI', en: 'CAESAR CIPHER DEVICE' },
  'cipher.subtitle': { tr: '\u0130\u00E7 halkay\u0131 \u00E7evirerek mesaj\u0131 \u00E7\u00F6z\u00FCn', en: 'Rotate the inner ring to decode the message' },
  'cipher.encoded': { tr: '\u015E\u0130FREL\u0130', en: 'ENCRYPTED' },
  'cipher.decoded': { tr: '\u00C7\u00D6Z\u00DCLM\u00DC\u015E', en: 'DECODED' },
  'cipher.solved': { tr: '\u015E\u0130FRE \u00C7\u00D6Z\u00DCLD\u00DC!', en: 'CIPHER SOLVED!' },
  'cipher.linkedin': { tr: 'LinkedIn Profili', en: 'LinkedIn Profile' },

  // FINGERPRINT
  'fp.title': { tr: 'PARMAK \u0130Z\u0130 E\u015ELE\u015ET\u0130RME', en: 'FINGERPRINT MATCHING' },
  'fp.subtitle': { tr: 'Hedef parmak izini a\u015Fa\u011F\u0131daki adaylar aras\u0131nda bulun', en: 'Find the target fingerprint among the candidates below' },
  'fp.target': { tr: 'HEDEF', en: 'TARGET' },
  'fp.hint': { tr: '\u0130pucu: Desenlerin genel \u015Feklini kar\u015F\u0131la\u015Ft\u0131r\u0131n', en: 'Hint: Compare the overall shape of the patterns' },
  'fp.found': { tr: 'E\u015ELE\u015EME BULUNDU', en: 'MATCH FOUND' },
  'fp.github': { tr: 'GitHub Profili', en: 'GitHub Profile' },

  // EVIDENCE BOARD
  'eb.title': { tr: 'KANIT PANOSU', en: 'EVIDENCE BOARD' },
  'eb.type.suspect': { tr: '\u015E\u00FCpheli', en: 'Suspect' },
  'eb.type.skill': { tr: 'Uzmanl\u0131k Alan\u0131', en: 'Expertise' },
  'eb.type.job': { tr: '\u0130\u015F Deneyimi', en: 'Work Experience' },
  'eb.type.edu': { tr: 'E\u011Fitim', en: 'Education' },

  // USER NOTES
  'notes.add': { tr: 'Not Ekle', en: 'Add Note' },
  'notes.delete': { tr: 'Sil', en: 'Delete' },
  'notes.placeholder': { tr: 'Not yaz...', en: 'Write a note...' },

  // DAYS & MONTHS (for smartphone)
  'days': { tr: ['Pazar','Pazartesi','Sal\u0131','\u00C7ar\u015Famba','Per\u015Fembe','Cuma','Cumartesi'], en: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] },
  'months': { tr: ['Ocak','\u015Eubat','Mart','Nisan','May\u0131s','Haziran','Temmuz','A\u011Fustos','Eyl\u00FCl','Ekim','Kas\u0131m','Aral\u0131k'], en: ['January','February','March','April','May','June','July','August','September','October','November','December'] },

  // SOUND TOGGLE
  'sound.toggle': { tr: 'Ses A\u00E7/Kapa', en: 'Toggle Sound' },
};

/**
 * Get translated string for current language
 * @param {string} key - Translation key
 * @returns {string|Array} Translated value
 */
export function t(key) {
  const entry = translations[key];
  if (!entry) return key;
  return entry[currentLang] ?? entry['en'] ?? key;
}

/**
 * Choose between Turkish and English values based on current language
 * @param {*} trValue - Turkish value
 * @param {*} enValue - English value
 * @returns {*} Value for current language
 */
export function tData(trValue, enValue) {
  if (currentLang === 'en' && enValue !== undefined && enValue !== null) {
    return enValue;
  }
  return trValue;
}

/**
 * Get current language code
 * @returns {'tr'|'en'}
 */
export function getLang() {
  return currentLang;
}

/**
 * Set language and persist
 * @param {'tr'|'en'} lang
 */
export function setLang(lang) {
  if (lang !== 'tr' && lang !== 'en') return;
  currentLang = lang;
  document.documentElement.lang = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {}

  // Update data-i18n elements
  updateDataI18nElements();

  // Update CSS custom property for note placeholder
  updateNotePlaceholder();

  // Fire all listeners
  listeners.forEach(cb => {
    try { cb(lang); } catch (e) { console.error('i18n listener error:', e); }
  });
}

/**
 * Toggle between en and tr
 */
export function toggleLang() {
  setLang(currentLang === 'en' ? 'tr' : 'en');
}

/**
 * Register a callback for language changes
 * @param {function} callback
 */
export function onLangChange(callback) {
  if (typeof callback === 'function') {
    listeners.push(callback);
  }
}

/**
 * Scan and update all elements with data-i18n attribute
 */
function updateDataI18nElements() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (typeof val === 'string') {
      el.textContent = val;
    }
  });
}

/**
 * Update CSS custom property for note placeholder text
 */
function updateNotePlaceholder() {
  const placeholder = t('notes.placeholder');
  document.documentElement.style.setProperty('--note-placeholder', "'" + placeholder + "'");
}

/**
 * Update the lang toggle button text
 */
function updateToggleButton() {
  const btn = document.getElementById('lang-toggle');
  if (btn) {
    btn.textContent = currentLang.toUpperCase();
  }
}

/**
 * Initialize i18n system
 * - Reads localStorage for saved language preference
 * - Creates toggle button
 * - Sets document lang attribute
 * - Updates all data-i18n elements
 */
export function initI18n() {
  // Read saved preference, default to 'en'
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'tr' || saved === 'en') {
      currentLang = saved;
    } else {
      currentLang = 'en';
    }
  } catch {
    currentLang = 'en';
  }

  // Set document lang
  document.documentElement.lang = currentLang;

  // Create toggle button
  const btn = document.createElement('button');
  btn.id = 'lang-toggle';
  btn.textContent = currentLang.toUpperCase();
  btn.addEventListener('click', () => {
    toggleLang();
    updateToggleButton();
  });
  document.body.appendChild(btn);

  // Register internal listener to update button
  onLangChange(() => updateToggleButton());

  // Initial update of data-i18n elements
  updateDataI18nElements();

  // Initial placeholder update
  updateNotePlaceholder();
}
