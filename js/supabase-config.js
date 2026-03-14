// ============================================================
//  supabase-config.js  —  shared across all pages
// ============================================================
const SUPABASE_URL  = 'https://zwflmmyakklmmhzpznce.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3ZmxtbXlha2tsbW1oenB6bmNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNjQxNjcsImV4cCI6MjA4ODc0MDE2N30.mUcKxQCSJ800DdiPRXoP9rPlcWzstPD0XHUjGQ7V3B4';
const CLOUDINARY_CLOUD  = 'difkfekry';
const CLOUDINARY_PRESET = 'giftess_upload';
// Supabase client (loaded via CDN)
let _sb = null;
function sb() {
  if (!_sb) _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  return _sb;
}

// ── Auth helpers ──────────────────────────────────────────────
async function getUser() {
  const { data } = await sb().auth.getUser();
  return data?.user || null;
}

async function getProfile(uid) {
  const { data } = await sb().from('profiles').select('*').eq('id', uid).single();
  return data;
}

async function getCurrentProfile() {
  const user = await getUser();
  if (!user) return null;
  return getProfile(user.id);
}

// ── Cart helpers (localStorage for guests, synced on login) ──
const CART_KEY = 'giftess_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartBadge();
}

function addToCart(product, qty = 1) {
  const cart = getCart();
  const idx  = cart.findIndex(i => i.id === product.id);
  if (idx > -1) { cart[idx].qty += qty; }
  else { cart.push({ id: product.id, name: product.name, price: product.price, image: product.images?.[0] || '', sku: product.sku, qty }); }
  saveCart(cart);
  showToast('Added to cart! 🛒');
}

function removeFromCart(id) {
  saveCart(getCart().filter(i => i.id !== id));
}

function updateCartQty(id, qty) {
  if (qty < 1) { removeFromCart(id); return; }
  const cart = getCart();
  const idx  = cart.findIndex(i => i.id === id);
  if (idx > -1) { cart[idx].qty = qty; saveCart(cart); }
}

function cartTotal() {
  return getCart().reduce((s, i) => s + i.price * i.qty, 0);
}

function cartCount() {
  return getCart().reduce((s, i) => s + i.qty, 0);
}

function updateCartBadge() {
  document.querySelectorAll('.cart-badge').forEach(el => {
    const c = cartCount();
    el.textContent = c;
    el.style.display = c > 0 ? 'flex' : 'none';
  });
}

// ── Wishlist (localStorage) ────────────────────────────────────
const WISH_KEY = 'giftess_wishlist';
function getWishlist() { try { return JSON.parse(localStorage.getItem(WISH_KEY)) || []; } catch { return []; } }
function isWished(id)  { return getWishlist().some(i => i.id === id); }
function toggleWishlist(product) {
  let w = getWishlist();
  if (isWished(product.id)) {
    w = w.filter(i => i.id !== product.id);
    showToast('Removed from wishlist');
  } else {
    w.push({ id: product.id, name: product.name, price: product.price, image: product.images?.[0] || '', sku: product.sku });
    showToast('Saved to wishlist 💜');
  }
  localStorage.setItem(WISH_KEY, JSON.stringify(w));
  return !isWished(product.id);
}

// ── Toast ──────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = 'gf-toast ' + type;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
}

// ── Navbar renderer ────────────────────────────────────────────
async function renderNavbar(activePage = '') {
  const user    = await getUser();
  const profile = user ? await getProfile(user.id) : null;
  const isAdmin = profile?.role === 'admin';

  const nav = document.getElementById('navbar');
  if (!nav) return;

  nav.innerHTML = `
    <div class="nav-announce">
      <span>✦</span>
      <span>🎁 Free shipping on orders above ₹999 &nbsp;|&nbsp; Same day dispatch before 2 PM</span>
      <span>✦</span>
    </div>
    <div class="nav-inner">
      <a href="/index.html" class="nav-logo">
        <div class="nav-logo-icon">🎁</div>
        <span>giftess</span>
      </a>
      <ul class="nav-links" id="navLinks">
        <li><a href="/index.html" class="${activePage==='home'?'active':''}">Home</a></li>
        <li><a href="/pages/products.html" class="${activePage==='products'?'active':''}">Shop</a></li>
        <li><a href="/pages/create-hamper.html" class="${activePage==='hamper'?'active':''}">Create Hamper</a></li>
        <li><a href="/pages/wishlist.html" class="${activePage==='wishlist'?'active':''}">Wishlist</a></li>
        ${isAdmin ? `<li><a href="/admin/index.html" style="color:var(--lavender-deep);font-weight:700;">Admin ⚙️</a></li>` : ''}
      </ul>
      <div class="nav-actions">
        <a href="/pages/cart.html" class="nav-icon-btn" style="position:relative;">
          🛒
          <span class="cart-badge" style="display:none;">0</span>
        </a>
        ${user ? `
          <div class="nav-user-menu" onclick="toggleUserDrop()">
            <div class="nav-avatar">${(profile?.name||user.email)[0].toUpperCase()}</div>
            <div class="user-dropdown" id="userDrop" style="display:none;">
              <div class="drop-name">${profile?.name || user.email}</div>
              <a href="/pages/dashboard.html">My Dashboard</a>
              <a href="/pages/wishlist.html">Wishlist</a>
              ${isAdmin ? `<a href="/admin/index.html">Admin Panel</a>` : ''}
              <button onclick="handleLogout()">Logout</button>
            </div>
          </div>
        ` : `
          <div class="nav-auth-btns">
            <a href="/pages/login.html" class="btn-login">Login</a>
            <a href="/pages/register.html" class="btn-register">Register</a>
          </div>
        `}
        <button class="hamburger" onclick="toggleMobileNav()">☰</button>
      </div>
    </div>`;

  updateCartBadge();
}

function toggleUserDrop() {
  const d = document.getElementById('userDrop');
  if (d) d.style.display = d.style.display === 'none' ? 'block' : 'none';
}
document.addEventListener('click', e => {
  if (!e.target.closest('.nav-user-menu')) {
    const d = document.getElementById('userDrop');
    if (d) d.style.display = 'none';
  }
});

function toggleMobileNav() {
  const links = document.getElementById('navLinks');
  if (links) links.classList.toggle('open');
}

async function handleLogout() {
  await sb().auth.signOut();
  window.location.href = '/index.html';
}

// ── Product card HTML ──────────────────────────────────────────
function productCardHTML(p) {
  const wished  = isWished(p.id);
  const imgHTML = p.images?.[0]
    ? `<img src="${p.images[0]}" alt="${p.name}" class="pc-img">`
    : `<div class="pc-img-placeholder">🎁</div>`;
  const badge   = p.badge ? `<span class="pc-badge ${p.badge.toLowerCase()}">${p.badge}</span>` : '';
  const origPrice = p.original_price ? `<span class="pc-orig">₹${Number(p.original_price).toLocaleString()}</span>` : '';

  return `
    <div class="product-card" data-id="${p.id}">
      <a href="/pages/product-detail.html?id=${p.id}" class="pc-img-wrap">
        ${imgHTML}
        ${badge}
        <button class="pc-wish ${wished?'wished':''}" onclick="handleWish(event,'${p.id}')">
          ${wished?'❤️':'🤍'}
        </button>
      </a>
      <div class="pc-info">
        <a href="/pages/product-detail.html?id=${p.id}" class="pc-name">${p.name}</a>
        <div class="pc-stars">★★★★★ <span>reviews</span></div>
        <div class="pc-price-row">
          <span class="pc-price">₹${Number(p.price).toLocaleString()}</span>
          ${origPrice}
        </div>
        <button class="pc-add-btn" onclick="handleAddCart('${p.id}')">🛒 Add to Cart</button>
      </div>
    </div>`;
}

// Store products in memory for cart operations
window._products = {};

async function handleAddCart(id) {
  let p = window._products[id];
  if (!p) {
    const { data } = await sb().from('products').select('*').eq('id', id).single();
    p = data;
  }
  if (p) { addToCart(p); }
}

function handleWish(e, id) {
  e.preventDefault(); e.stopPropagation();
  let p = window._products[id];
  if (!p) return;
  const btn = e.currentTarget;
  const wished = toggleWishlist(p);
  btn.textContent = wished ? '🤍' : '❤️';
  btn.classList.toggle('wished', !wished);
}

// ── Hamper discount rules ──────────────────────────────────────
async function getHamperDiscount(count, subtotal) {
  const { data } = await sb().from('hamper_discounts').select('*').order('min_items');
  if (!data) return 0;
  const rule = data.find(r => count >= r.min_items && count <= r.max_items);
  if (!rule) return 0;
  if (rule.type === 'flat') return rule.value;
  return Math.round((subtotal * rule.value) / 100);
}

// run on every page load
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
});
// ── Cloudinary Upload ─────────────────────────────────────────
async function uploadToCloudinary(file, statusElId, imageInputId, previewId, previewImgId) {
  document.getElementById(statusElId).textContent = '⏳ Uploading…';
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', CLOUDINARY_PRESET);

  try {
    const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
      method: 'POST', body: form
    });
    const data = await res.json();

    if (data.secure_url) {
      document.getElementById(imageInputId).value      = data.secure_url;
      document.getElementById(statusElId).textContent  = '✅ Uploaded!';
      document.getElementById(previewId).style.display = 'block';
      document.getElementById(previewImgId).src         = data.secure_url;
      return data.secure_url;
    } else {
      document.getElementById(statusElId).textContent = '❌ Upload failed: ' + (data.error?.message || 'Unknown error');
      return null;
    }
  } catch (err) {
    document.getElementById(statusElId).textContent = '❌ Error: ' + err.message;
    return null;
  }
}
