/**
 * DEPÓSITO DENTAL SAN LORENZO — app.js
 * Agencia: Lert_Agencia
 *
 * Módulos:
 *  1. Catálogo de productos
 *  2. Estado de carritos (localStorage)
 *  3. Vista Tienda (B2C)
 *  4. Vista POS
 *  5. Modal de confirmación
 *  6. Toasts / notificaciones
 *  7. Navegación entre vistas
 *  8. Init
 */

'use strict';

/* ══════════════════════════════════════════════════════
   1. CATÁLOGO CENTRAL
═══════════════════════════════════════════════════════ */
const CATALOG = [
  { id: 1, name: 'Resina Microhíbrida Filtek A2',        sku: 'RES-Z250-3M',  price: 650,  pts: 15, icon: '🪥', badge: 'Más Vendido',     badgeClass: '' },
  { id: 2, name: 'Guantes de Nitrilo Grado Médico ×100', sku: 'GUA-NIT-MD',   price: 180,  pts:  5, icon: '🧤', badge: 'Stock Controlado', badgeClass: 'cyan' },
  { id: 3, name: 'Anestesia Mepivacaína 2% ×50',         sku: 'ANE-MEPI-2',   price: 420,  pts: 10, icon: '💉', badge: 'Línea Quirúrgica', badgeClass: 'cobalt' },
  { id: 4, name: 'Cemento de Ionómero Vitremer',         sku: 'CEM-ION-3M',   price: 310,  pts:  8, icon: '🧪', badge: 'Restauración',     badgeClass: '' },
  { id: 5, name: 'Hilo Retractor #00 Ultrapak',          sku: 'HIL-RET-00',   price: 95,   pts:  3, icon: '🧵', badge: 'Periodoncia',      badgeClass: 'cyan' },
  { id: 6, name: 'Fresas de Carburo Tallo Largo ×10',    sku: 'FRE-CAR-TL',   price: 240,  pts:  6, icon: '⚙️', badge: 'Instrumental',     badgeClass: '' },
  { id: 7, name: 'Cubetas de Impresión Plástico ×12',    sku: 'CUB-IMP-P12',  price: 75,   pts:  2, icon: '🦷', badge: 'Impresión',        badgeClass: '' },
  { id: 8, name: 'Adhesivo Single Bond Universal 3M',    sku: 'ADH-SBU-3M',   price: 520,  pts: 12, icon: '🔬', badge: 'Premium',          badgeClass: 'gold' },
];

/* ══════════════════════════════════════════════════════
   2. ESTADO + localStorage
═══════════════════════════════════════════════════════ */
const LS_STORE = 'ddsl_store_cart';
const LS_POS   = 'ddsl_pos_cart';
const LS_DISC  = 'ddsl_pos_discount';

let storeCart   = _loadLS(LS_STORE, []);
let posCart     = _loadLS(LS_POS,   []);
let posDiscount = _loadLS(LS_DISC,  0);

function _loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function _saveLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* cuota llena: silencioso */ }
}

/* ══════════════════════════════════════════════════════
   3. UTILIDADES
═══════════════════════════════════════════════════════ */

/** Formatea número a moneda MXN */
function fmt(n) {
  return '$' + n.toFixed(2);
}

/** Muestra un toast temporal */
function showToast(html, type = '') {
  const container = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = html;
  container.appendChild(el);
  setTimeout(() => el.remove(), 2900);
}

/* ══════════════════════════════════════════════════════
   4. NAVEGACIÓN ENTRE VISTAS
═══════════════════════════════════════════════════════ */
function switchView(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.btn-tab').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });

  document.getElementById('view-' + view).classList.add('active');
  const tab = document.getElementById('tab-' + view);
  tab.classList.add('active');
  tab.setAttribute('aria-selected', 'true');
}

/* ══════════════════════════════════════════════════════
   5. VISTA TIENDA — Render catálogo
═══════════════════════════════════════════════════════ */
function renderCatalog() {
  const grid = document.getElementById('catalog-grid');
  document.getElementById('catalog-count').textContent = CATALOG.length + ' productos';

  grid.innerHTML = CATALOG.map(p => `
    <div class="product-card">
      <span class="prod-badge ${p.badgeClass}">${p.badge}</span>
      <div class="prod-img" aria-hidden="true">${p.icon}</div>
      <div class="prod-body">
        <p class="prod-sku">${p.sku}</p>
        <h3 class="prod-name">${p.name}</h3>
        <div class="prod-footer">
          <span class="prod-price">${fmt(p.price)}</span>
          <span class="prod-pts">+${p.pts} pts</span>
        </div>
        <button
          class="btn-add"
          id="add-btn-${p.id}"
          onclick="addToStoreCart(${p.id})"
          aria-label="Agregar ${p.name} al carrito"
        >+ Agregar al carrito</button>
      </div>
    </div>
  `).join('');
}

/* ══════════════════════════════════════════════════════
   6. VISTA TIENDA — Carrito
═══════════════════════════════════════════════════════ */
function addToStoreCart(id) {
  const p = CATALOG.find(x => x.id === id);
  if (!p) return;

  storeCart.push({ id: p.id, name: p.name, price: p.price });
  _saveLS(LS_STORE, storeCart);
  renderStoreCart();
  updateBadges();

  // Feedback visual en el botón
  const btn = document.getElementById('add-btn-' + id);
  if (btn) {
    btn.textContent = '✓ Agregado';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = '+ Agregar al carrito';
      btn.classList.remove('added');
    }, 1200);
  }

  showToast(`✅ <strong>${p.name}</strong> agregado al carrito`, 'success');
}

function removeFromStoreCart(index) {
  storeCart.splice(index, 1);
  _saveLS(LS_STORE, storeCart);
  renderStoreCart();
  updateBadges();
}

function clearStoreCart() {
  if (storeCart.length === 0) return;
  storeCart = [];
  _saveLS(LS_STORE, storeCart);
  renderStoreCart();
  updateBadges();
  showToast('🗑️ Carrito vaciado');
}

function renderStoreCart() {
  const itemsEl   = document.getElementById('store-cart-items');
  const summaryEl = document.getElementById('store-cart-summary');
  const countLbl  = document.getElementById('cart-count-label');

  countLbl.textContent = storeCart.length;

  if (storeCart.length === 0) {
    itemsEl.innerHTML = '<div class="cart-empty"><span class="empty-icon" aria-hidden="true">🦷</span>Agrega insumos al carrito</div>';
    summaryEl.style.display = 'none';
    return;
  }

  itemsEl.innerHTML = storeCart.map((item, i) => `
    <div class="cart-row">
      <span class="cart-row-name">${item.name}</span>
      <span class="cart-row-price">${fmt(item.price)}</span>
      <button class="btn-remove" onclick="removeFromStoreCart(${i})" aria-label="Quitar ${item.name}">✕</button>
    </div>
  `).join('');

  const sub = storeCart.reduce((s, x) => s + x.price, 0);
  document.getElementById('s-subtotal').textContent = fmt(sub);
  document.getElementById('s-total').textContent    = fmt(sub);
  summaryEl.style.display = 'block';
}

function checkout() {
  if (storeCart.length === 0) {
    showToast('⚠️ El carrito está vacío', 'error');
    return;
  }
  const sub = storeCart.reduce((s, x) => s + x.price, 0);
  openModal('🛒', 'Pedido Enviado', 'Tu pedido fue registrado. Te contactaremos para confirmar disponibilidad y coordinar el envío.', storeCart, sub, 0, 'Web');
  storeCart = [];
  _saveLS(LS_STORE, storeCart);
  renderStoreCart();
  updateBadges();
}

/* ══════════════════════════════════════════════════════
   7. VISTA POS — Quick grid
═══════════════════════════════════════════════════════ */
function renderQuickGrid(filter = '') {
  const grid  = document.getElementById('quick-grid');
  const lower = filter.toLowerCase();

  const items = CATALOG.filter(p =>
    !filter ||
    p.name.toLowerCase().includes(lower) ||
    p.sku.toLowerCase().includes(lower)
  );

  if (items.length === 0) {
    grid.innerHTML = `<p style="color:var(--muted);font-size:13px;padding:10px 0;grid-column:1/-1">
      Sin resultados para "<strong>${filter}</strong>"
    </p>`;
    return;
  }

  grid.innerHTML = items.map(p => `
    <div class="quick-card" onclick="addToPosCart(${p.id})" role="button" tabindex="0"
      aria-label="Agregar ${p.name} al ticket"
      onkeydown="if(event.key==='Enter'||event.key===' ')addToPosCart(${p.id})">
      <span class="qc-icon" aria-hidden="true">${p.icon}</span>
      <span class="qc-name">${p.name.split(' ').slice(0, 3).join(' ')}</span>
      <span class="qc-price">${fmt(p.price)}</span>
    </div>
  `).join('');
}

function filterQuickGrid(value) {
  renderQuickGrid(value);
}

/* ══════════════════════════════════════════════════════
   8. VISTA POS — Ticket / carrito
═══════════════════════════════════════════════════════ */
function addToPosCart(id) {
  const p = CATALOG.find(x => x.id === id);
  if (!p) return;

  posCart.push({ id: p.id, name: p.name, price: p.price });
  _saveLS(LS_POS, posCart);
  renderTicket();
  updateBadges();
  showToast(`✅ ${p.name.split(' ').slice(0, 3).join(' ')} → ticket`, 'success');
}

function removeFromPosCart(index) {
  posCart.splice(index, 1);
  _saveLS(LS_POS, posCart);
  renderTicket();
  updateBadges();
}

function clearPosCart() {
  posCart      = [];
  posDiscount  = 0;
  _saveLS(LS_POS,  posCart);
  _saveLS(LS_DISC, posDiscount);
  document.getElementById('pos-client').value = '0';
  renderTicket();
  updateBadges();
}

function applyDiscount() {
  posDiscount = parseFloat(document.getElementById('pos-client').value) || 0;
  _saveLS(LS_DISC, posDiscount);
  renderTicket();
}

function renderTicket() {
  const itemsEl = document.getElementById('ticket-items');

  if (posCart.length === 0) {
    itemsEl.innerHTML = '<div class="cart-empty"><span class="empty-icon" aria-hidden="true">📋</span>Ticket vacío</div>';
    document.getElementById('t-subtotal').textContent     = '$0.00';
    document.getElementById('t-discount').textContent     = '-$0.00';
    document.getElementById('t-total').textContent        = '$0.00';
    document.getElementById('discount-label').textContent = Math.round(posDiscount * 100) + '%';
    return;
  }

  itemsEl.innerHTML = posCart.map((item, i) => `
    <div class="ticket-item">
      <span class="ti-name">${item.name}</span>
      <span class="ti-price">${fmt(item.price)}</span>
      <button class="btn-remove" onclick="removeFromPosCart(${i})" aria-label="Quitar ${item.name}">✕</button>
    </div>
  `).join('');

  const sub  = posCart.reduce((s, x) => s + x.price, 0);
  const disc = sub * posDiscount;
  const tot  = sub - disc;

  document.getElementById('t-subtotal').textContent     = fmt(sub);
  document.getElementById('t-discount').textContent     = '-' + fmt(disc);
  document.getElementById('t-total').textContent        = fmt(tot);
  document.getElementById('discount-label').textContent = Math.round(posDiscount * 100) + '%';
}

function processPayment(method) {
  if (posCart.length === 0) {
    showToast('⚠️ El ticket está vacío', 'error');
    return;
  }
  const sub  = posCart.reduce((s, x) => s + x.price, 0);
  const disc = sub * posDiscount;
  const tot  = sub - disc;

  openModal(
    '✅',
    'Transacción Exitosa',
    `Pago procesado por <strong>${method}</strong>. El stock fue actualizado correctamente.`,
    posCart, sub, disc, method
  );

  clearPosCart();
}

/* ══════════════════════════════════════════════════════
   9. MODAL DE CONFIRMACIÓN
═══════════════════════════════════════════════════════ */
function openModal(icon, title, msg, items, sub, disc, method) {
  const tot = sub - disc;

  document.getElementById('modal-icon').textContent  = icon;
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-msg').innerHTML     = msg;

  const rows = items.map(i =>
    `<div class="mt-row"><span>${i.name}</span><span>${fmt(i.price)}</span></div>`
  ).join('');

  const discRow = disc > 0
    ? `<div class="mt-row"><span>Descuento</span><span>-${fmt(disc)}</span></div>`
    : '';

  document.getElementById('modal-ticket').innerHTML =
    rows +
    `<div class="mt-row" style="border-top:1px dashed var(--border);margin-top:8px;padding-top:8px;">
       <span>Subtotal</span><span>${fmt(sub)}</span>
     </div>` +
    discRow +
    `<div class="mt-row grand">
       <span>TOTAL${method ? ' (' + method + ')' : ''}</span>
       <span>${fmt(tot)}</span>
     </div>`;

  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

/* ══════════════════════════════════════════════════════
   10. BADGES DEL HEADER
═══════════════════════════════════════════════════════ */
function updateBadges() {
  document.getElementById('store-badge').textContent = storeCart.length;
  document.getElementById('pos-badge').textContent   = posCart.length;
}

/* ══════════════════════════════════════════════════════
   11. FECHA EN TICKET
═══════════════════════════════════════════════════════ */
function updateTicketDate() {
  const el = document.getElementById('ticket-date');
  if (!el) return;
  const opts = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  el.textContent = new Date().toLocaleDateString('es-MX', opts);
}

/* ══════════════════════════════════════════════════════
   12. RESTAURAR SELECTOR DE DESCUENTO
═══════════════════════════════════════════════════════ */
function restoreDiscountSelect() {
  if (posDiscount === 0) return;
  const sel = document.getElementById('pos-client');
  for (let i = 0; i < sel.options.length; i++) {
    if (parseFloat(sel.options[i].value) === posDiscount) {
      sel.selectedIndex = i;
      break;
    }
  }
}

/* ══════════════════════════════════════════════════════
   13. CERRAR MODAL AL CLICK FUERA
═══════════════════════════════════════════════════════ */
document.getElementById('modal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

/* ══════════════════════════════════════════════════════
   14. INIT
═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderCatalog();
  renderQuickGrid();
  renderStoreCart();
  renderTicket();
  updateBadges();
  updateTicketDate();
  restoreDiscountSelect();

  // Actualizar hora del ticket cada minuto
  setInterval(updateTicketDate, 60_000);
});

/* ══════════════════════════════════════════════════════
   15. LÓGICA DE BOTONES FLOTANTES
═══════════════════════════════════════════════════════ */
const btnTop = document.getElementById('btn-back-top');

if (btnTop) {
  // Mostrar/ocultar al hacer scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btnTop.classList.remove('hidden');
    } else {
      btnTop.classList.add('hidden');
    }
  });

  // Animación suave hacia arriba al hacer clic
  btnTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}