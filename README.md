# 🎁 Giftess — Supabase Website

Pure HTML/CSS/JS website powered by Supabase. No build step, no Node.js needed.

---

## ⚡ Setup in 3 Steps

### Step 1 — Run the SQL Schema

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `SETUP_DATABASE.sql` and paste the entire content
5. Click **Run** (green button)

✅ This creates all tables, security rules, and adds demo products!

---

### Step 2 — Create Storage Bucket for Images

1. Supabase Dashboard → **Storage**
2. Click **New Bucket**
3. Name it: `product-images`
4. Check **Public bucket** → Create
5. Click the bucket → **Policies** → Add policy:
   - **SELECT**: `true` (anyone can view)
   - **INSERT**: `(auth.role() = 'authenticated')` (logged in users can upload)

---

### Step 3 — Open the Website

Just open `index.html` in your browser — or upload the entire folder to any web host.

**For local testing** — use a simple server (needed for links to work properly):
- VS Code: install **Live Server** extension → right-click index.html → Open with Live Server
- Or run: `npx serve .` in the folder

---

## 🔑 Make Yourself Admin

1. Open the website → Register a new account
2. Go to **Supabase Dashboard → Table Editor → profiles**
3. Find your row → click Edit
4. Change `role` from `customer` to `admin`
5. Go to `/admin/index.html` — you now have full admin access!

**Or use the Settings page in Admin Panel:**
Go to `/admin/settings.html` → "Make Yourself Admin" → enter your email

---

## 📁 File Structure

```
giftess-supabase/
├── index.html                  ← Homepage
├── SETUP_DATABASE.sql          ← Run this in Supabase first!
├── css/
│   ├── global.css              ← All shared styles
│   ├── home.css                ← Homepage styles
│   └── admin.css               ← Admin panel styles
├── js/
│   ├── supabase-config.js      ← Supabase client + helpers
│   └── footer.js               ← Footer renderer
├── pages/
│   ├── products.html           ← Shop with filters
│   ├── product-detail.html     ← Single product + reviews
│   ├── cart.html               ← Shopping cart + free gift
│   ├── checkout.html           ← Checkout + address
│   ├── order-detail.html       ← Order tracking
│   ├── create-hamper.html      ← Custom hamper builder
│   ├── dashboard.html          ← User orders + wishlist
│   ├── login.html              ← Login
│   └── register.html           ← Register
└── admin/
    ├── index.html              ← Dashboard (stats + recent orders)
    ├── products.html           ← Add/edit/delete products + images
    ├── orders.html             ← Manage orders + tracking
    ├── reviews.html            ← Approve/reject reviews
    ├── users.html              ← View all users
    ├── categories.html         ← Manage categories
    ├── free-gifts.html         ← Set free gift items
    ├── discounts.html          ← Hamper discount rules
    ├── extra-items.html        ← "Make it special" add-ons
    └── settings.html           ← Site settings + make admin
```

---

## ✅ All Features

| Feature | ✅ |
|---|---|
| Homepage (hero, categories, products, testimonials) | ✅ |
| Products page with search + filter by category & price | ✅ |
| Product detail with image gallery + extra items + reviews | ✅ |
| Shopping cart (localStorage, persists across pages) | ✅ |
| Free gift unlock (cart ≥ ₹999) | ✅ |
| Custom Hamper Builder (min 5 items, auto discounts) | ✅ |
| Checkout with address + payment method | ✅ |
| Order tracking with courier info | ✅ |
| Wishlist (heart icon, localStorage) | ✅ |
| User Dashboard with order history | ✅ |
| Supabase Auth (login + register) | ✅ |
| Admin: Products CRUD + Supabase Storage images | ✅ |
| Admin: Orders + status updates + tracking | ✅ |
| Admin: Review approval + manual reviews | ✅ |
| Admin: Free gifts, extra items, discounts | ✅ |
| Admin: Categories management | ✅ |
| Admin: Settings + Make Admin tool | ✅ |
| WhatsApp float button | ✅ |
| Mobile responsive | ✅ |

---

## 🌐 Deploy for Free

**Netlify (recommended):**
1. Go to [netlify.com](https://netlify.com) → New site
2. Drag and drop this folder
3. Done! You get a live URL instantly.

**Vercel:**
1. Go to [vercel.com](https://vercel.com) → New Project
2. Upload this folder
3. Done!

---

📞 WhatsApp: +91 6002698296 | 📷 Instagram: @gif_tess
