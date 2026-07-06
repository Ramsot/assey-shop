/* ============================================================
   ASSEY Atelier — Frontend Application
   Vanilla JS, no build step required.
   ============================================================ */

'use strict';

const { API, COLLECTION_GRADIENTS, SHIPPING_LABELS } = window.ASSEY;

/* ---- Utilities ------------------------------------------- */

function getCookie(name) {
  const val = document.cookie
    .split('; ')
    .find(r => r.startsWith(name + '='));
  return val ? decodeURIComponent(val.split('=')[1]) : null;
}

async function apiFetch(url, opts = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...opts.headers,
  };
  const csrfToken = getCookie('csrftoken');
  if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes((opts.method || 'GET').toUpperCase())) {
    headers['X-CSRFToken'] = csrfToken;
  }
  const res = await fetch(url, { ...opts, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw Object.assign(new Error(err.detail || err.error || 'Request failed'), { status: res.status, data: err });
  }
  return res.json();
}

function fmt(amount) {
  return '$' + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtFull(amount) {
  return '$' + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function qs(sel, ctx = document) { return ctx.querySelector(sel); }
function qsa(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

/* ---- Toast ----------------------------------------------- */

let _toastTimer;
function showToast(msg) {
  const el = qs('[data-toast]');
  if (!el) return;
  qs('[data-toast-text]', el).textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ---- Cart state (synced from API) ------------------------ */

const cart = { items: [], count: 0, total_price: 0 };

function updateBadge() {
  qsa('[data-bag-count]').forEach(el => { el.textContent = cart.count || 0; });
}

async function syncCart() {
  try {
    const data = await apiFetch(API.CART);
    cart.items       = data.items       || [];
    cart.count       = data.count       || 0;
    cart.total_price = data.total_price || 0;
  } catch {
    cart.items = []; cart.count = 0; cart.total_price = 0;
  }
  updateBadge();
  renderCartSidebar();
}

async function addToCart(sku, color, qty = 1) {
  try {
    const data = await apiFetch(API.CART_ADD, {
      method: 'POST',
      body: JSON.stringify({ sku, color, quantity: qty }),
    });
    cart.items       = data.items       || [];
    cart.count       = data.count       || 0;
    cart.total_price = data.total_price || 0;
    updateBadge();
    renderCartSidebar();
    openCartSidebar();
  } catch (e) {
    showToast(e?.data?.error || 'Could not add to bag');
  }
}

async function removeFromCart(sku, color) {
  try {
    const data = await apiFetch(API.CART_REMOVE, {
      method: 'POST',
      body: JSON.stringify({ sku, color }),
    });
    cart.items       = data.items       || [];
    cart.count       = data.count       || 0;
    cart.total_price = data.total_price || 0;
    updateBadge();
    renderCartSidebar();
  } catch (e) {
    showToast('Could not remove item');
  }
}

/* ---- Footer: dynamic collection links -------------------- */

let _footerCollectionsCache = null;

async function renderFooterCollections() {
  const containers = qsa('[data-footer-collections]');
  if (!containers.length) return;

  try {
    if (!_footerCollectionsCache) {
      const data = await apiFetch(API.COLLECTIONS);
      _footerCollectionsCache = Array.isArray(data) ? data : (data.results || []);
    }
    const cols = _footerCollectionsCache;
    if (!cols.length) return;

    containers.forEach(el => {
      el.innerHTML = cols.map(c =>
        `<a href="/shop/?collection=${encodeURIComponent(c.key)}">${c.title || c.name}</a>`
      ).join('');
    });
  } catch {
    /* Leave the static fallback link in place on failure */
  }
}

/* ---- Intersection observer for fade-up ------------------- */

const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      fadeObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

function observeFadeUp() {
  qsa('.fade-up').forEach(el => fadeObserver.observe(el));
}

/* ---- Product card renderer ------------------------------- */

function buildProductCard(product) {
  const img = product.display_image_url || product.image_url || '';
  const colors = Array.isArray(product.colors) ? product.colors : [];
  const colorsHtml = colors.slice(0, 5).map((c, i) =>
    `<span class="color-dot${i === 0 ? ' active' : ''}"
       style="background:${c.hex || c.name || '#ccc'}"
       title="${c.name || ''}"
       data-color="${c.name || ''}"
       tabindex="0"
       role="radio"
       aria-label="${c.name || 'Color'}"
       aria-checked="${i === 0}"></span>`
  ).join('');

  const tags     = Array.isArray(product.tags) ? product.tags.map(t => String(t).toLowerCase()) : [];
  const stock    = product.stock_qty ?? 0;
  const soldOut  = stock === 0;
  const lowStock = !soldOut && stock > 0 && stock <= 3;
  const isNew    = tags.includes('new');
  const isBest   = tags.includes('best') || product.is_featured;

  /* Build badge HTML */
  let badgesHtml = '';
  if (soldOut) {
    badgesHtml = '<span class="badge badge-sold">Sold Out</span>';
  } else {
    if (isNew)    badgesHtml += '<span class="badge badge-new">New</span>';
    if (isBest)   badgesHtml += '<span class="badge badge-best">Best seller</span>';
    if (lowStock) badgesHtml += `<span class="badge badge-low">Only ${stock} left</span>`;
  }

  const card = document.createElement('article');
  card.className = 'card fade-up' + (soldOut ? ' sold-out' : '');
  card.dataset.sku      = product.sku;
  card.dataset.price    = product.price;
  card.dataset.material = (product.material || '').toLowerCase();
  card.dataset.size     = (product.size || '').toLowerCase();
  card.dataset.tags     = JSON.stringify(product.tags || []);
  card.dataset.collections = JSON.stringify(
    (product.collections || []).map(c => c.key)
  );
  card.dataset.featured = product.is_featured ? '1' : '0';
  card.dataset.created  = product.created_at || '';
  card.dataset.name     = (product.name || '').toLowerCase();
  card.dataset.activeColor = colors[0]?.name || '';

  card.innerHTML = `
    ${badgesHtml ? `<div class="card-badges">${badgesHtml}</div>` : ''}
    <div class="card-img">
      ${img
        ? `<img src="${img}" alt="${product.name}" loading="lazy" />`
        : `<div class="card-img-placeholder">${product.sku}</div>`}
    </div>
    <div class="card-body">
      <div class="card-name">${product.name}</div>
      ${product.subtitle ? `<div class="card-sub">${product.subtitle}</div>` : ''}
      ${colors.length ? `<div class="card-colors">${colorsHtml}</div>` : ''}
      <div class="card-price">${fmt(product.price)}</div>
      <div class="card-actions">
        <button class="btn primary" type="button" data-add-btn
          aria-label="Add ${product.name} to bag"
          ${soldOut ? 'disabled' : ''}>
          ${soldOut ? 'Sold Out' : 'Add to bag'}
        </button>
      </div>
    </div>`;

  /* Color selection */
  qsa('.color-dot', card).forEach(dot => {
    dot.addEventListener('click', () => {
      qsa('.color-dot', card).forEach(d => { d.classList.remove('active'); d.setAttribute('aria-checked', 'false'); });
      dot.classList.add('active');
      dot.setAttribute('aria-checked', 'true');
      card.dataset.activeColor = dot.dataset.color;
    });
    dot.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dot.click(); } });
  });

  /* Add to bag */
  if (!soldOut) {
    qs('[data-add-btn]', card).addEventListener('click', () => {
      addToCart(product.sku, card.dataset.activeColor || '');
    });
  }

  return card;
}

/* ---- Collection tile renderer ---------------------------- */

function buildCollectionTile(col) {
  const gradient = COLLECTION_GRADIENTS[col.key] || COLLECTION_GRADIENTS.default;
  const tile = document.createElement('a');
  tile.className = 'tile mid fade-up';
  tile.href = `/shop/?collection=${col.key}`;
  tile.style.cssText = `grid-column: span 4; background: ${gradient};`;
  if (col.image_url) {
    tile.innerHTML = `<img src="${col.image_url}" alt="${col.name}" loading="lazy" />`;
  }
  tile.innerHTML += `
    <div class="shade"></div>
    <div class="meta">
      <div class="cap">${col.caption || 'Collection'}</div>
      <div class="name">${col.title || col.name}</div>
    </div>`;
  return tile;
}

/* ---- Skeleton loaders ------------------------------------ */

function renderSkeletons(grid, count = 4) {
  grid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const s = document.createElement('article');
    s.className = 'card card-skeleton';
    s.innerHTML = `
      <div class="card-img"></div>
      <div class="card-body">
        <div class="card-name"></div>
        <div class="card-sub"></div>
        <div class="card-price"></div>
      </div>`;
    grid.appendChild(s);
  }
}

/* ============================================================
   PAGE: HOME
   ============================================================ */

async function initHome() {
  await syncCart();

  /* Collections */
  const tilesGrid = qs('[data-collection-tiles]');
  if (tilesGrid) {
    try {
      const cols = await apiFetch(API.COLLECTIONS);
      const list = Array.isArray(cols) ? cols : (cols.results || []);
      if (list.length === 0) {
        tilesGrid.innerHTML = '';
      } else {
        list.filter(c => c.key).forEach(col => {
          tilesGrid.appendChild(buildCollectionTile(col));
        });
      }
    } catch {
      tilesGrid.innerHTML = '';
    }
  }

  /* Best sellers */
  const bestGrid = qs('[data-best-grid]');
  if (bestGrid) {
    renderSkeletons(bestGrid, 4);
    try {
      const data = await apiFetch(API.PRODUCTS + '?is_featured=true');
      const products = Array.isArray(data) ? data : (data.results || []);
      bestGrid.innerHTML = '';
      if (products.length === 0) {
        bestGrid.innerHTML = '<p class="muted" style="padding:24px">No featured products yet.</p>';
      } else {
        products.slice(0, 4).forEach(p => bestGrid.appendChild(buildProductCard(p)));
      }
    } catch {
      bestGrid.innerHTML = '<p class="muted" style="padding:24px">Products unavailable.</p>';
    }
  }

  /* Hero image from first featured product */
  const heroImg = qs('[data-hero-img]');
  if (heroImg) {
    try {
      const data = await apiFetch(API.PRODUCTS + '?is_featured=true&page_size=1');
      const products = Array.isArray(data) ? data : (data.results || []);
      if (products[0]?.display_image_url || products[0]?.image_url) {
        heroImg.src = products[0].display_image_url || products[0].image_url;
        heroImg.style.opacity = '0';
        heroImg.onload = () => { heroImg.style.transition = 'opacity .8s ease'; heroImg.style.opacity = '1'; };
      }
    } catch { /* hero image is optional */ }
  }

  observeFadeUp();
}

/* ============================================================
   PAGE: SHOP
   ============================================================ */

async function initShop() {
  await syncCart();

  const grid = qs('[data-product-grid]');
  const countEl = qs('[data-product-count]');
  if (!grid) return;

  let allProducts = [];
  let activeFilters = { tags: [], materials: [], sizes: [], colors: [] };
  let sortMode = 'featured';
  let searchQuery = '';

  /* Read initial collection from URL hash/query */
  const urlParams = new URLSearchParams(location.search);
  const initCollection = urlParams.get('collection') || location.hash.replace('#', '');

  renderSkeletons(grid, 8);

  try {
    const data = await apiFetch(API.PRODUCTS + '?page_size=100');
    allProducts = Array.isArray(data) ? data : (data.results || []);
  } catch {
    grid.innerHTML = '<div class="empty-state"><h3>Products unavailable</h3><p>Please refresh the page.</p></div>';
    return;
  }

  /* Pre-filter by collection from URL */
  if (initCollection) {
    activeFilters.tags = [initCollection];
    /* Check corresponding filter checkbox */
    qsa(`[data-filter-tag][value="${initCollection}"]`).forEach(el => { el.checked = true; });
    if (initCollection) {
      const el = document.getElementById(initCollection);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function applySort(products) {
    return [...products].sort((a, b) => {
      switch (sortMode) {
        case 'new':        return new Date(b.created_at) - new Date(a.created_at);
        case 'price_asc':  return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        default:           return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      }
    });
  }

  function filterProducts() {
    const q = searchQuery.toLowerCase().trim();
    return allProducts.filter(p => {
      /* Text search */
      if (q) {
        const haystack = [
          p.name, p.subtitle, p.description, p.sku,
          ...(p.colors || []).map(c => c.name),
        ].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      const cols = (p.collections || []).map(c => c.key);
      const tags = Array.isArray(p.tags) ? p.tags.map(t => String(t).toLowerCase()) : [];
      const allTagsAndCols = [...cols, ...tags];

      if (activeFilters.tags.length) {
        const match = activeFilters.tags.some(t => allTagsAndCols.includes(t.toLowerCase()));
        if (!match) return false;
      }
      if (activeFilters.materials.length) {
        if (!activeFilters.materials.some(m => (p.material || '').toLowerCase() === m.toLowerCase())) return false;
      }
      if (activeFilters.sizes.length) {
        if (!activeFilters.sizes.some(s => (p.size || '').toLowerCase() === s.toLowerCase())) return false;
      }
      if (activeFilters.colors.length) {
        const productColors = (p.colors || []).map(c => (c.name || '').toLowerCase());
        if (!activeFilters.colors.some(c => productColors.includes(c.toLowerCase()))) return false;
      }
      return true;
    });
  }

  function renderGrid() {
    const filtered = applySort(filterProducts());
    grid.innerHTML = '';
    if (countEl) countEl.textContent = filtered.length;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <h3>No products match</h3>
          <p>Try adjusting or clearing your filters.</p>
          <button class="btn" type="button" data-clear-filters>Clear all filters</button>
        </div>`;
      qs('[data-clear-filters]', grid)?.addEventListener('click', clearFilters);
      return;
    }

    filtered.forEach(p => grid.appendChild(buildProductCard(p)));
    observeFadeUp();
  }

  function clearFilters() {
    activeFilters = { tags: [], materials: [], sizes: [], colors: [] };
    qsa('[data-filter-tag], [data-filter-material], [data-filter-size], [data-filter-color]')
      .forEach(el => { el.checked = false; });
    renderGrid();
  }

  /* Filter event listeners */
  document.addEventListener('change', e => {
    const el = e.target;
    if (el.matches('[data-filter-tag]')) {
      if (el.checked) activeFilters.tags.push(el.value);
      else activeFilters.tags = activeFilters.tags.filter(v => v !== el.value);
      renderGrid();
    } else if (el.matches('[data-filter-material]')) {
      if (el.checked) activeFilters.materials.push(el.value);
      else activeFilters.materials = activeFilters.materials.filter(v => v !== el.value);
      renderGrid();
    } else if (el.matches('[data-filter-size]')) {
      if (el.checked) activeFilters.sizes.push(el.value);
      else activeFilters.sizes = activeFilters.sizes.filter(v => v !== el.value);
      renderGrid();
    } else if (el.matches('[data-filter-color]')) {
      if (el.checked) activeFilters.colors.push(el.value);
      else activeFilters.colors = activeFilters.colors.filter(v => v !== el.value);
      renderGrid();
    }
  });

  /* Search */
  let _searchDebounce;
  qs('[data-search]')?.addEventListener('input', e => {
    clearTimeout(_searchDebounce);
    _searchDebounce = setTimeout(() => { searchQuery = e.target.value; renderGrid(); }, 280);
  });

  /* Sort */
  const sortEl = qs('[data-sort]');
  sortEl?.addEventListener('change', () => { sortMode = sortEl.value; renderGrid(); });

  /* Clear filters */
  qsa('[data-clear-filters]').forEach(btn => btn.addEventListener('click', clearFilters));

  /* Mobile drawer */
  const drawer = qs('[data-drawer]');
  qsa('[data-open-filters]').forEach(btn => btn.addEventListener('click', () => drawer?.classList.add('open')));
  qsa('[data-close-filters]').forEach(btn => btn.addEventListener('click', () => drawer?.classList.remove('open')));
  drawer?.addEventListener('click', e => { if (e.target === drawer) drawer.classList.remove('open'); });

  renderGrid();
}

/* ============================================================
   PAGE: CHECKOUT
   ============================================================ */

function fmtShipping(cost) {
  return Number(cost) === 0 ? 'Free' : fmtFull(cost);
}

async function initCheckout() {
  await syncCart();

  const form         = qs('[data-checkout-form]');
  const itemsEl      = qs('[data-order-items]');
  const subtotalEl   = qs('[data-subtotal]');
  const shippingEl   = qs('[data-shipping]');
  const taxEl        = qs('[data-tax]');
  const totalEl      = qs('[data-total]');
  const emptyEl      = qs('[data-empty]');
  const submitBtn    = form ? qs('[type="submit"]', form) : null;

  if (cart.items.length === 0) {
    if (emptyEl) emptyEl.style.display = '';
    if (submitBtn) submitBtn.disabled = true;
  }

  /* Render order summary */
  async function renderSummary(shippingMethod = 'standard') {
    if (!itemsEl) return;
    if (cart.items.length === 0) {
      if (emptyEl) emptyEl.style.display = '';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    itemsEl.innerHTML = cart.items.map(item => `
      <div class="summary-item">
        <div class="summary-item-img"></div>
        <div class="summary-item-info">
          <div class="summary-item-name">${item.name}</div>
          <div class="summary-item-meta">${item.color ? item.color + ' · ' : ''}Qty ${item.qty}</div>
        </div>
        <div class="summary-item-price">${fmtFull(Number(item.price) * item.qty)}</div>
      </div>`).join('');

    try {
      const summary = await apiFetch(API.SUMMARY, {
        method: 'POST',
        body: JSON.stringify({
          items: cart.items.map(i => ({ sku: i.sku, quantity: i.qty })),
          shipping_method: shippingMethod,
        }),
      });
      if (subtotalEl)  subtotalEl.textContent  = fmtFull(summary.subtotal);
      if (shippingEl)  shippingEl.textContent  = fmtShipping(summary.shipping_cost);
      if (taxEl)       taxEl.textContent       = fmtFull(summary.tax);
      if (totalEl)     totalEl.textContent     = fmtFull(summary.total);
    } catch {
      const sub = cart.items.reduce((s, i) => s + Number(i.price) * i.qty, 0);
      if (subtotalEl) subtotalEl.textContent = fmtFull(sub);
    }
  }

  await renderSummary();

  /* ---- Stepper logic -------------------------------------- */
  const steps = qsa('.step', form?.closest('section'));
  const deliveryInputs = qsa('[data-step-section="delivery"] .input', form);
  const paymentInputs  = qsa('[data-step-section="payment"] .input', form);

  function updateStepper() {
    const dComplete = deliveryInputs.every(i => i.value.trim() !== '' || !i.required);
    const pComplete = paymentInputs.every(i => i.value.trim() !== '');
    steps.forEach((s, idx) => {
      s.classList.remove('active', 'completed');
      if (idx === 0) {
        if (dComplete) s.classList.add('completed');
        else s.classList.add('active');
      } else if (idx === 1) {
        if (pComplete) s.classList.add('completed');
        else if (dComplete) s.classList.add('active');
      } else if (idx === 2) {
        if (dComplete && pComplete) s.classList.add('active');
      }
    });
  }

  /* Track stepper on input */
  [...deliveryInputs, ...paymentInputs].forEach(i => {
    i.addEventListener('input', updateStepper);
    i.addEventListener('blur', updateStepper);
  });
  updateStepper();

  /* ---- Card formatting ------------------------------------ */
  const cardInput = qs('[name="cardNumber"]', form);
  cardInput?.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 16);
    v = v.replace(/(.{4})/g, '$1 ').trim();
    e.target.value = v;
  });

  const expiryInput = qs('[name="expiry"]', form);
  expiryInput?.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 2) v = v.substring(0, 2) + ' / ' + v.substring(2);
    e.target.value = v;
  });

  const cvcInput = qs('[name="cvc"]', form);
  cvcInput?.addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
  });

  /* Re-calculate when shipping changes */
  form?.addEventListener('change', e => {
    if (e.target.name === 'shipping') renderSummary(e.target.value);
  });

  /* Form submission */
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    if (cart.items.length === 0) return;

    const data = Object.fromEntries(new FormData(form));
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Placing order…'; }

    try {
      /* Step 1: create shipping address */
      const address = await apiFetch(API.ADDRESSES, {
        method: 'POST',
        body: JSON.stringify({
          first_name:  data.firstName,
          last_name:   data.lastName,
          email:       data.email,
          address1:    data.address1,
          city:        data.city,
          postal_code: data.postal,
          country:     data.country,
          phone:       data.phone || '',
        }),
      });

      /* Step 2: create order */
      const order = await apiFetch(API.ORDERS, {
        method: 'POST',
        body: JSON.stringify({
          email:               data.email,
          shipping_address_id: address.id,
          shipping_method:     data.shipping || 'standard',
          notes:               data.notes || '',
          items: cart.items.map(i => ({
            sku:      i.sku,
            color:    i.color || '',
            quantity: i.qty,
          })),
        }),
      });

      /* Step 3: clear cart, redirect */
      await apiFetch(API.CART_CLEAR, { method: 'POST', body: JSON.stringify({}) });
      window.location.href = `/order-confirmation/?order_number=${order.order_number}`;
    } catch (err) {
      showToast(err?.data?.error || 'Order failed. Please try again.');
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Place order'; }
    }
  });
}

/* ============================================================
   PAGE: ORDER CONFIRMATION
   ============================================================ */

async function initConfirmation() {
  const params = new URLSearchParams(location.search);
  const orderNumber = params.get('order_number');

  const orderIdEl    = qs('[data-order-id]');
  const orderDateEl  = qs('[data-order-date]');
  const orderNotesEl = qs('[data-order-notes]');
  const orderTotalEl = qs('[data-order-total]');
  const orderEmailEl = qs('[data-order-email]');

  if (!orderNumber) {
    if (orderIdEl) orderIdEl.textContent = 'Order not found';
    return;
  }

  try {
    const order = await apiFetch(`${API.CONFIRM}?order_number=${orderNumber}`);
    if (orderIdEl)    orderIdEl.textContent    = order.order_number;
    if (orderDateEl)  orderDateEl.textContent  = new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    if (orderNotesEl) orderNotesEl.textContent = order.notes || '—';
    if (orderTotalEl) orderTotalEl.textContent = fmtFull(order.total);
    if (orderEmailEl) orderEmailEl.textContent = order.email;
  } catch {
    if (orderIdEl) orderIdEl.textContent = orderNumber;
    if (orderDateEl) orderDateEl.textContent = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  /* Print button */
  qs('[data-print-order]')?.addEventListener('click', () => window.print());

  updateBadge();
  observeFadeUp();
}

/* ============================================================
   CART SIDEBAR
   ============================================================ */

function openCartSidebar() {
  qs('[data-cart-sidebar]')?.classList.add('open');
  qs('[data-cart-overlay]')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCartSidebar() {
  qs('[data-cart-sidebar]')?.classList.remove('open');
  qs('[data-cart-overlay]')?.classList.remove('open');
  document.body.style.overflow = '';
}

function renderCartSidebar() {
  const body      = qs('[data-cart-body]');
  const subtotalEl = qs('[data-cart-subtotal]');
  const totalEl    = qs('[data-cart-total]');
  if (!body) return;

  if (!cart.items.length) {
    body.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">&#9676;</div>
        <p>Your bag is empty.<br>Explore the collection.</p>
        <a class="btn primary" href="/shop/" style="margin-top:8px">Shop now</a>
      </div>`;
    if (subtotalEl) subtotalEl.textContent = '$0.00';
    if (totalEl)    totalEl.textContent    = '$0.00';
    return;
  }

  body.innerHTML = `<div class="cart-items">${
    cart.items.map(item => {
      const lineTotal = (Number(item.price) * item.qty).toFixed(2);
      return `
        <div class="cart-item" data-sku="${item.sku}" data-color="${item.color || ''}">
          <div class="cart-item-img"></div>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-meta">${item.color || 'One size'}</div>
            <div class="cart-item-price">${fmtFull(item.price)} each</div>
            <div class="qty-stepper">
              <button class="qty-btn" data-qty-dec aria-label="Decrease">−</button>
              <span class="qty-value">${item.qty}</span>
              <button class="qty-btn" data-qty-inc aria-label="Increase">+</button>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
            <button class="cart-item-remove" data-remove title="Remove">✕</button>
            <span style="font-size:13px;font-weight:700;white-space:nowrap">${fmtFull(lineTotal)}</span>
          </div>
        </div>`;
    }).join('')
  }</div>`;

  /* Wire up qty + remove buttons */
  qsa('.cart-item', body).forEach(row => {
    const sku   = row.dataset.sku;
    const color = row.dataset.color;
    const qtyEl = qs('.qty-value', row);

    qs('[data-qty-inc]', row)?.addEventListener('click', async () => {
      const cur = parseInt(qtyEl.textContent);
      await addToCart(sku, color, 1);
    });

    qs('[data-qty-dec]', row)?.addEventListener('click', async () => {
      const cur = parseInt(qtyEl.textContent);
      if (cur <= 1) {
        await removeFromCart(sku, color);
      } else {
        /* Remove then re-add with cur-1 — simplest approach since API has no update endpoint */
        await removeFromCart(sku, color);
        if (cur > 1) await addToCart(sku, color, cur - 1);
      }
    });

    qs('[data-remove]', row)?.addEventListener('click', () => removeFromCart(sku, color));
  });

  const total = fmtFull(cart.total_price);
  if (subtotalEl) subtotalEl.textContent = total;
  if (totalEl)    totalEl.textContent    = total;
}

/* Cart sidebar event delegation */
document.addEventListener('click', e => {
  /* Open bag */
  if (e.target.closest('[data-bag]')) {
    openCartSidebar();
    return;
  }
  /* Close */
  if (e.target.closest('[data-cart-close]') || e.target.matches('[data-cart-overlay]')) {
    closeCartSidebar();
    return;
  }
  /* Go to checkout from sidebar */
  if (e.target.closest('[data-cart-checkout]')) {
    if (cart.items.length === 0) { showToast('Your bag is empty'); return; }
    window.location.href = '/checkout/';
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeCartSidebar();
});

/* ============================================================
   ROUTER — detect page and initialise
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  const body = document.body;

  /* Footer collections run on every page, in parallel with page init */
  renderFooterCollections();

  if (body.hasAttribute('data-page-home')) {
    await initHome();
  } else if (body.hasAttribute('data-page-shop')) {
    await initShop();
  } else if (body.hasAttribute('data-page-checkout')) {
    await initCheckout();
  } else if (body.hasAttribute('data-page-confirmation')) {
    await initConfirmation();
  } else {
    await syncCart();
    observeFadeUp();
  }
});
