const fs = require('fs');
const path = require('path');

// 為每個區塊加入背景圖片 div
// 並且確保父元素有 position: relative 以及內容 z-index: 1

const RULES = [
  // index.html
  { file: 'index.html', tag: '<section class="hero">', img: 'assets/home_hero_banner.jpg' },
  { file: 'index.html', tag: '<section class="section" id="products">', img: 'assets/home_product_strawberry.jpg' },

  // product.html
  { file: 'product.html', tag: '<section class="page-hero">', img: 'assets/product_top_banner.jpg' },
  { file: 'product.html', tag: '<div class="gallery-main">', img: 'assets/product_main_strawberry_gallery.jpg' },
  { file: 'product.html', tag: '<article class="other-card">', img: 'assets/product_other_chocolate.jpg' },
  { file: 'product.html', tag: '<h3>巧克力雪花酥</h3>', img: null },
  { file: 'product.html', tag: '<h3>原味雪花酥</h3>', img: null },

  // about.html
  { file: 'about.html', tag: '<section class="hero">', img: 'assets/about_hero_banner.jpg' },
  { file: 'about.html', tag: '<div class="photo-card">', img: 'assets/about_story_photo.jpg' },
  { file: 'about.html', tag: '<div class="step-img">', img: 'assets/about_process_steps.jpg' },

  // order.html
  { file: 'order.html', tag: '<section class="hero">', img: 'assets/order_notice_hero_banner.jpg' },
  { file: 'order.html', tag: '<article class="notice-card">', img: 'assets/order_notice_notice_cards.jpg' },
  { file: 'order.html', tag: '<section class="bulk-box">', img: 'assets/order_notice_bulk_order.jpg' },

  // contact.html
  { file: 'contact.html', tag: '<section class="hero">', img: 'assets/contact_hero_banner.jpg' },
  { file: 'contact.html', tag: '<section class="panel contact-panel">', img: 'assets/contact_contact_info_form.jpg' },
  { file: 'contact.html', tag: '<section class="panel map-panel">', img: 'assets/contact_map_visit.jpg' },
  { file: 'contact.html', tag: '<section class="faq">', img: 'assets/contact_faq.jpg' },

  // login.html
  { file: 'login.html', tag: '<section class="brand-side">', img: 'assets/login_brand_photo_left.jpg' },
  { file: 'login.html', tag: '<div class="login-card">', img: 'assets/login_login_card.jpg' },

  // register.html
  { file: 'register.html', tag: '<section class="brand-side">', img: 'assets/register_brand_photo_left.jpg' },
  { file: 'register.html', tag: '<div class="register-card">', img: 'assets/register_register_card.jpg' },

  // forgot.html
  { file: 'forgot.html', tag: '<section class="brand-side">', img: 'assets/forgot_password_brand_photo_left.jpg' },
  { file: 'forgot.html', tag: '<div class="reset-card">', img: 'assets/forgot_password_reset_card.jpg' },

  // cart.html
  { file: 'cart.html', tag: '<section class="hero">', img: 'assets/cart_hero_banner.jpg' },
  { file: 'cart.html', tag: '<div class="panel cart-box">', img: 'assets/cart_cart_items.jpg' },
  { file: 'cart.html', tag: '<aside class="panel summary">', img: 'assets/cart_order_summary.jpg' },
  { file: 'cart.html', tag: '<section class="panel recommend">', img: 'assets/cart_recommend_products.jpg' },
];

// ===== 執行注入 =====
const byFile = {};
for (const r of RULES) {
  if (!byFile[r.file]) byFile[r.file] = [];
  byFile[r.file].push(r);
}

for (const [file, rules] of Object.entries(byFile)) {
  const filePath = path.join(__dirname, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. 為 section-bg 相關 class 加入 position:relative 的 CSS
  let addCss = '';

  // 需要加 position relative 的 class 列表（那些沒有本身沒有 relative 的）
  const relClasses = [
    'hero',
    'page-hero', 'gallery-main', 'other-card',
    'photo-card', 'step-img',
    'notice-card', 'bulk-box',
    'brand-side', 'register-card', 'reset-card',
    'cart-box', 'recommend',
    'faq', 'contact-panel', 'map-panel',
    'panel',
  ];

  for (const cls of relClasses) {
    if (html.includes(cls)) {
      addCss += `
  .${cls} { position: relative; overflow: hidden; }`;
    }
  }

  addCss += `
  .section-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    z-index: 0;
    pointer-events: none;
    mix-blend-mode: multiply;
    opacity: 0.6;
  }`;

  // 2. 插入背景 div（在每個 tag 後面）
  let insertCount = 0;
  let bgIdx = 0;
  for (const r of rules) {
    if (!r.img) continue;

    const tagStart = html.indexOf(r.tag);
    if (tagStart === -1) {
      console.log(`⚠ ${file}: "${r.tag}" not found`);
      continue;
    }

    const openTag = r.tag;
    // 找到開標籤的 > 位置（如果 tag 裡沒有 >）
    const closeBracket = html.indexOf('>', tagStart);
    const insertPos = closeBracket + 1;

    const bgHtml = `\n<div class="section-bg" style="background-image:url('${r.img}')"></div>`;
    html = html.slice(0, insertPos) + bgHtml + html.slice(insertPos);
    insertCount++;
    bgIdx++;
  }

  // 3. inject CSS
  const bodyIdx = html.indexOf('<body');
  const lastStyleEnd = html.lastIndexOf('</style>', bodyIdx) + '</style>'.length;
  html = html.slice(0, lastStyleEnd) + addCss + '\n' + html.slice(lastStyleEnd);

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✅ ${file}: ${insertCount} images inserted`);
}

console.log('\n🎉 Done!');
