// footer.js — renders footer on every page
function renderFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;
  footer.innerHTML = `
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="footer-logo">🎁 giftess</div>
        <p>Premium customised gift hampers crafted with love for every special occasion. Celebrate life's moments with gifts that truly matter.</p>
        <div class="footer-social">
          <a href="https://instagram.com/gif_tess" target="_blank">📷 @gif_tess</a>
          <a href="https://wa.me/916002698296" target="_blank">💬 WhatsApp Us</a>
        </div>
        <p class="footer-hours">📦 Orders processed 7 days/week, 9 AM – 9 PM IST</p>
      </div>
      <div class="footer-col">
        <h4>Quick Links</h4>
        <ul>
          <li><a href="/index.html">Home</a></li>
          <li><a href="/pages/products.html">Shop All</a></li>
          <li><a href="/pages/create-hamper.html">Create Hamper</a></li>
          <li><a href="/pages/dashboard.html">My Orders</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Categories</h4>
        <ul>
          <li><a href="/pages/products.html?cat=birthday">Birthday Gifts</a></li>
          <li><a href="/pages/products.html?cat=anniversary">Anniversary</a></li>
          <li><a href="/pages/products.html?cat=her">Gifts for Her</a></li>
          <li><a href="/pages/products.html?cat=gourmet">Gourmet Gifts</a></li>
          <li><a href="/pages/products.html?cat=selfcare">Self Care</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Contact</h4>
        <ul>
          <li><a href="tel:+916002698296">📱 +91 6002698296</a></li>
          <li><a href="https://wa.me/916002698296">💬 WhatsApp</a></li>
          <li><a href="mailto:hello@giftess.in">📧 hello@giftess.in</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 Giftess. All rights reserved. Made with 💜 in India</p>
      <p>Privacy Policy · Terms · Shipping Policy</p>
    </div>
  `;
}
