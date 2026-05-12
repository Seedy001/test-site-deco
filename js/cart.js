const Cart = (() => {
  let items = JSON.parse(localStorage.getItem('me_cart') || '[]');

  const save = () => localStorage.setItem('me_cart', JSON.stringify(items));

  const count = () => items.reduce((n, i) => n + i.qty, 0);

  const total = () => items.reduce((s, i) => s + i.price * i.qty, 0);

  const add = (product, qty = 1) => {
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({ ...product, qty });
    }
    save();
    render();
    open();
    updateBadge();
  };

  const remove = (id) => {
    items = items.filter(i => i.id !== id);
    save();
    render();
    updateBadge();
  };

  const updateBadge = () => {
    const badge = document.getElementById('cartCount');
    if (!badge) return;
    const n = count();
    badge.textContent = n;
    badge.classList.toggle('visible', n > 0);
    const ic = document.getElementById('cartItemCount');
    if (ic) ic.textContent = n;
  };

  const formatPrice = (n) => n.toFixed(2).replace('.', ',') + ' €';

  const render = () => {
    const container = document.getElementById('cartItems');
    const footer = document.getElementById('cartFooter');
    const totalEl = document.getElementById('cartTotal');
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <p>Votre panier est vide</p>
          <a href="pages/catalogue.html" class="btn btn-primary">Découvrir nos produits</a>
        </div>`;
      if (footer) footer.style.display = 'none';
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="cart-item">
        <div class="cart-item-img">${item.emoji}</div>
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatPrice(item.price)} × ${item.qty}</div>
        </div>
        <button class="cart-item-remove" onclick="Cart.remove(${item.id})" aria-label="Supprimer">✕</button>
      </div>`).join('');

    if (footer) footer.style.display = 'block';
    if (totalEl) totalEl.textContent = formatPrice(total());
  };

  const open = () => {
    document.getElementById('cartDrawer')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    document.getElementById('cartDrawer')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
  };

  const init = () => {
    render();
    updateBadge();
    document.getElementById('cartBtn')?.addEventListener('click', open);
    document.getElementById('cartClose')?.addEventListener('click', close);
    document.getElementById('cartOverlay')?.addEventListener('click', close);
  };

  return { add, remove, open, close, init, items: () => items, total, count };
})();

window.Cart = Cart;
