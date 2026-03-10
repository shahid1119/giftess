// admin-common.js
function showToast(msg, type='success') {
  const t = document.createElement('div');
  t.className = 'gf-toast ' + type;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
}

function renderSidebar(activePage) {
  const nav = [
    { id:'dashboard',   label:'Dashboard',         icon:'📊', href:'index.html' },
    { id:'products',    label:'Products',           icon:'🎁', href:'products.html' },
    { id:'orders',      label:'Orders',             icon:'📦', href:'orders.html' },
    { id:'reviews',     label:'Reviews',            icon:'⭐', href:'reviews.html' },
    { id:'users',       label:'Users',              icon:'👥', href:'users.html' },
    { id:'categories',  label:'Categories',         icon:'🗂',  href:'categories.html' },
    { id:'freegifts',   label:'Free Gifts',         icon:'🎀', href:'free-gifts.html' },
    { id:'discounts',   label:'Hamper Discounts',   icon:'💜', href:'discounts.html' },
    { id:'extras',      label:'Extra Items',        icon:'✨', href:'extra-items.html' },
    { id:'settings',    label:'Settings',           icon:'⚙️', href:'settings.html' },
  ];
  const side = document.getElementById('sidebar');
  if (!side) return;
  side.innerHTML = `
    <div class="side-header">
      <div class="side-logo">🎁 giftess</div>
      <div class="side-badge">Admin Panel</div>
    </div>
    <nav class="side-nav">
      ${nav.map(n => `
        <a href="/admin/${n.href}" class="nav-item ${activePage===n.id?'active':''}" onclick="closeSidebar()">
          <span class="nav-icon">${n.icon}</span>${n.label}
        </a>`).join('')}
    </nav>
    <div class="side-footer">
      <div class="side-admin-name" id="adminName">Admin</div>
      <button class="logout-btn" onclick="adminLogout()">🚪 Logout</button>
    </div>`;
}

function closeSidebar() {
  const s = document.getElementById('sidebar');
  if (s) s.classList.remove('open');
}

function toggleSidebar() {
  const s = document.getElementById('sidebar');
  if (s) s.classList.toggle('open');
}

async function adminLogout() {
  await sb().auth.signOut();
  location.href = '/pages/login.html';
}

async function requireAdmin() {
  const user = await getUser();
  if (!user) { location.href = '/pages/login.html'; return null; }
  const profile = await getProfile(user.id);
  if (profile?.role !== 'admin') { location.href = '/index.html'; return null; }
  const nameEl = document.getElementById('adminName');
  if (nameEl) nameEl.textContent = profile.name || user.email;
  return { user, profile };
}
