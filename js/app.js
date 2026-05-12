document.addEventListener('DOMContentLoaded', () => {
  Cart.init();
  initHeader();
  initSearch();
  initProducts();
  initCountdown();
  initNewsletter();
  initCookieBanner();
  initBackToTop();
});

/* ===== HEADER ===== */
function initHeader() {
  const header = document.getElementById('site-header');
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const nav = document.getElementById('mainNav');

  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 40);
    document.getElementById('backToTop')?.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  mobileBtn?.addEventListener('click', () => {
    nav?.classList.toggle('open');
    mobileBtn.classList.toggle('open');
  });
}

/* ===== SEARCH ===== */
function initSearch() {
  const btn = document.getElementById('searchBtn');
  const panel = document.getElementById('searchPanel');
  const input = document.getElementById('searchInput');
  const close = document.getElementById('searchClose');
  const suggestions = document.getElementById('searchSuggestions');

  const open = () => { panel?.classList.add('open'); input?.focus(); };
  const closePanel = () => { panel?.classList.remove('open'); if (input) input.value = ''; if (suggestions) suggestions.innerHTML = ''; };

  btn?.addEventListener('click', open);
  close?.addEventListener('click', closePanel);

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

  input?.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q || q.length < 2) { suggestions.innerHTML = ''; return; }
    const results = window.PRODUCTS?.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) || [];
    suggestions.innerHTML = results.slice(0, 5).map(p => `
      <a href="pages/produit.html?id=${p.id}" class="search-suggestion">
        <span class="suggestion-emoji">${p.emoji}</span>
        <div>
          <div class="suggestion-name">${p.name}</div>
          <div class="suggestion-cat">${p.category} · ${p.price.toFixed(2).replace('.', ',')} €</div>
        </div>
      </a>`).join('') || '<div class="no-results">Aucun résultat trouvé</div>';
  });
}

/* ===== PRODUCTS ===== */
function initProducts() {
  const grid = document.getElementById('productsGrid');
  const tabs = document.querySelectorAll('.tab-btn');
  if (!grid || !window.PRODUCTS) return;

  const render = (tab = 'tendance') => {
    const list = PRODUCTS.filter(p => p.tab === tab);
    grid.innerHTML = list.map(p => productCard(p)).join('');
  };

  render();

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      grid.style.opacity = '0';
      setTimeout(() => { render(btn.dataset.tab); grid.style.opacity = '1'; }, 150);
    });
  });
}

function productCard(p) {
  const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : null;
  const badges = p.badges.map(b => {
    if (b === 'new') return '<span class="badge-new">Nouveau</span>';
    if (b === 'sale') return '<span class="badge-sale">Promo</span>';
    if (b === 'popular') return '<span class="badge-popular">Populaire</span>';
    return '';
  }).join('');

  return `
    <div class="product-card" data-id="${p.id}">
      <div class="product-img-wrap">
        <div class="product-img-placeholder" style="font-size:4rem; background: linear-gradient(145deg, ${p.color}22, ${p.color}44);">
          ${p.emoji}
        </div>
        <div class="product-badges">${badges}</div>
        <div class="product-actions">
          <button class="action-btn" onclick="wishlistAdd(${p.id})" aria-label="Ajouter aux favoris">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <a href="pages/produit.html?id=${p.id}" class="action-btn" aria-label="Voir le produit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </a>
        </div>
      </div>
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <h3 class="product-name">
          <a href="pages/produit.html?id=${p.id}">${p.name}</a>
        </h3>
        <div class="product-rating">
          <span class="stars-small">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5 - Math.floor(p.rating))}</span>
          <span class="rating-count">${p.rating} (${p.reviewCount})</span>
        </div>
        <div class="product-price">
          <span class="price-current">${p.price.toFixed(2).replace('.', ',')} €</span>
          ${p.originalPrice ? `<span class="price-original">${p.originalPrice.toFixed(2).replace('.', ',')} €</span>` : ''}
          ${discount ? `<span class="price-discount">-${discount}%</span>` : ''}
        </div>
        <button class="btn-add-cart" onclick="Cart.add(window.PRODUCTS.find(x=>x.id===${p.id}))">
          Ajouter au panier
        </button>
      </div>
    </div>`;
}

function wishlistAdd(id) {
  const p = window.PRODUCTS?.find(x => x.id === id);
  if (!p) return;
  const wl = JSON.parse(localStorage.getItem('me_wishlist') || '[]');
  if (!wl.find(x => x.id === id)) { wl.push(p); localStorage.setItem('me_wishlist', JSON.stringify(wl)); }
  showToast(`${p.emoji} Ajouté à votre liste de souhaits`);
}

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = 'position:fixed;bottom:32px;left:50%;transform:translateX(-50%) translateY(40px);background:#1a1a1a;color:white;padding:12px 24px;border-radius:24px;font-size:.875rem;font-weight:500;z-index:9999;opacity:0;transition:all .3s;white-space:nowrap;max-width:90vw;text-align:center;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(-50%) translateY(40px)'; }, 3000);
}

window.showToast = showToast;
window.wishlistAdd = wishlistAdd;

/* ===== COUNTDOWN ===== */
function initCountdown() {
  const target = new Date();
  target.setDate(target.getDate() + 7);
  target.setHours(23, 59, 59, 0);

  const els = {
    days: document.getElementById('cdDays'),
    hours: document.getElementById('cdHours'),
    minutes: document.getElementById('cdMinutes'),
    seconds: document.getElementById('cdSeconds')
  };

  if (!els.days) return;

  const pad = n => String(n).padStart(2, '0');

  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) { clearInterval(id); return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    els.days.textContent = pad(d);
    els.hours.textContent = pad(h);
    els.minutes.textContent = pad(m);
    els.seconds.textContent = pad(s);
  };

  tick();
  const id = setInterval(tick, 1000);
}

/* ===== NEWSLETTER ===== */
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail')?.value;
    if (!email?.includes('@')) return;

    const success = document.getElementById('newsletterSuccess');
    form.querySelector('.newsletter-input-group').style.display = 'none';
    if (success) success.style.display = 'flex';

    const subs = JSON.parse(localStorage.getItem('me_newsletter') || '[]');
    if (!subs.includes(email)) { subs.push(email); localStorage.setItem('me_newsletter', JSON.stringify(subs)); }
  });
}

/* ===== COOKIE BANNER ===== */
function initCookieBanner() {
  if (localStorage.getItem('me_cookies')) return;

  const banner = document.getElementById('cookieBanner');
  if (!banner) return;

  setTimeout(() => banner.classList.add('visible'), 1500);

  document.getElementById('cookieAccept')?.addEventListener('click', () => {
    localStorage.setItem('me_cookies', 'all');
    banner.classList.remove('visible');
  });

  document.getElementById('cookieCustomize')?.addEventListener('click', () => {
    localStorage.setItem('me_cookies', 'minimal');
    banner.classList.remove('visible');
  });
}

/* ===== BACK TO TOP ===== */
function initBackToTop() {
  document.getElementById('backToTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* SEARCH SUGGESTION STYLES */
const searchStyles = document.createElement('style');
searchStyles.textContent = `
  .search-suggestions { display: flex; flex-direction: column; gap: 4px; margin-top: 12px; }
  .search-suggestion { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-radius: var(--radius-sm); transition: background .15s; text-decoration: none; color: var(--color-dark); border: 1px solid var(--color-border); }
  .search-suggestion:hover { background: var(--color-light); }
  .suggestion-emoji { font-size: 1.5rem; width: 36px; text-align: center; }
  .suggestion-name { font-size: .9rem; font-weight: 600; }
  .suggestion-cat { font-size: .8rem; color: var(--color-medium); }
  .no-results { text-align: center; padding: 16px; color: var(--color-medium); font-size: .875rem; }
  .products-grid { transition: opacity .15s; }
`;
document.head.appendChild(searchStyles);
