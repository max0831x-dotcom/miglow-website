const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.join(__dirname, 'components');
const HEADER_HTML = fs.readFileSync(path.join(COMPONENTS_DIR, 'header.html'), 'utf8').trim();
const FOOTER_HTML = fs.readFileSync(path.join(COMPONENTS_DIR, 'footer.html'), 'utf8').trim();
const CHAT_CSS = '<link rel="stylesheet" href="assets/chat.css">\n';
const CHAT_JS = '<script src="assets/chat.js"></script>\n';

const PAGES = [
  { file: 'index.html',     footerId: 'contact' },
  { file: 'product.html',   footerId: null },
  { file: 'about.html',     footerId: null },
  { file: 'order.html',     footerId: null },
  { file: 'contact.html',   footerId: null },
  { file: 'login.html',     footerId: null },
  { file: 'register.html',  footerId: null },
  { file: 'forgot.html',    footerId: null },
  { file: 'cart.html',      footerId: null },
];

for (const page of PAGES) {
  const filePath = path.join(__dirname, page.file);
  let html = fs.readFileSync(filePath, 'utf8');

  // === Remove any previously injected chat assets to avoid duplicates ===
  html = html.split('\n').filter(function(line) {
    return line.indexOf('assets/chat.css') === -1 && line.indexOf('assets/chat.js') === -1;
  }).join('\n');

  // === Replace header ===
  const bodyOpen = html.indexOf('<body');
  const bodyClose = html.indexOf('</body>');
  const bodyContent = html.slice(bodyOpen, bodyClose);

  const headerStartInBody = bodyContent.indexOf('<header class="nav">');
  if (headerStartInBody === -1) {
    console.log('❌ ' + page.file + ': header not found');
    continue;
  }
  const headerEndInBody = bodyContent.indexOf('</header>', headerStartInBody) + '</header>'.length;

  const footerTagStart = bodyContent.lastIndexOf('<footer', bodyContent.length);
  const footerTagEnd = bodyContent.indexOf('</footer>', footerTagStart) + '</footer>'.length;

  if (footerTagStart === -1 || footerTagEnd === -1) {
    console.log('❌ ' + page.file + ': footer not found');
    continue;
  }

  const beforeHeader = bodyContent.slice(0, headerStartInBody);
  const middle = bodyContent.slice(headerEndInBody, footerTagStart);
  const afterFooter = bodyContent.slice(footerTagEnd);

  let finalFooter = FOOTER_HTML;
  if (page.footerId) {
    finalFooter = FOOTER_HTML.replace('<footer>', '<footer class="footer" id="' + page.footerId + '">');
  }

  const newBody = beforeHeader + HEADER_HTML + middle + finalFooter + afterFooter;
  const result = html.slice(0, bodyOpen) + newBody + html.slice(bodyClose).replace('</body>', CHAT_CSS + CHAT_JS + '</body>');

  fs.writeFileSync(filePath, result, 'utf8');
  console.log('✅ ' + page.file + ' updated');
}

console.log('\n🎉 All pages rebuilt!');
