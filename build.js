const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.join(__dirname, 'components');
const HEADER = fs.readFileSync(path.join(COMPONENTS_DIR, 'header.html'), 'utf8').trim();
const FOOTER = fs.readFileSync(path.join(COMPONENTS_DIR, 'footer.html'), 'utf8').trim();

// 頁面列表：{ file, headerFrom, headerTo, footerFrom, footerTo }
// line numbers 是 1-indexed
const PAGES = [
  { file: 'index.html',     headerFrom: 413, headerTo: 428,     footerFrom: 546, footerTo: 557,     footerHasClass: true },
  { file: 'product.html',   headerFrom: 411, headerTo: 424,     footerFrom: 535, footerTo: 543,     footerHasClass: false },
  { file: 'about.html',     headerFrom: 467, headerTo: 480,     footerFrom: 603, footerTo: 611,     footerHasClass: false },
  { file: 'order.html',     headerFrom: 373, headerTo: 386,     footerFrom: 543, footerTo: 551,     footerHasClass: false },
  { file: 'contact.html',   headerFrom: 61,  headerTo: 67,      footerFrom: 125, footerTo: 130,     footerHasClass: false },
  { file: 'login.html',     headerFrom: 35,  headerTo: 39,      footerFrom: 98,  footerTo: 103,     footerHasClass: false },
  { file: 'register.html',  headerFrom: 53,  headerTo: 57,      footerFrom: 110, footerTo: 115,     footerHasClass: false },
  { file: 'forgot.html',    headerFrom: 55,  headerTo: 59,      footerFrom: 114, footerTo: 119,     footerHasClass: false },
];

for (const page of PAGES) {
  const filePath = path.join(__dirname, page.file);
  let lines = fs.readFileSync(filePath, 'utf8').split('\n');

  // 替換 header
  let beforeHeader = lines.slice(0, page.headerFrom - 1);
  let afterHeader = lines.slice(page.headerTo); // line after </header>

  // 替換 footer
  const footerEnd = page.footerTo;
  // 找到 footer 之後的內容（footer 後面可能有空行或其它）
  let beforeFooter = lines.slice(0, page.footerFrom - 1);
  let afterFooter = lines.slice(footerEnd); // line after </footer>

  // 重組：beforeHeader + HEADER + afterHeader 剩下的（從 header 後到 footer 前）
  // 先從原始 lines 取出 header 和 footer 之間的內容
  let middleContent = lines.slice(page.headerTo, page.footerFrom - 1);

  // 組裝
  let result = [
    ...beforeHeader,
    HEADER,
    ...middleContent,
    FOOTER,
    ...afterFooter,
  ];

  // 如果是 index.html，footer 有 class="footer"，把 FOOTER 中的 <footer> 加上 class
  if (page.footerHasClass) {
    // 找到 FOOTER 在 result 中的位置並替換
    const footerIdx = result.indexOf(FOOTER);
    if (footerIdx !== -1) {
      result[footerIdx] = FOOTER.replace('<footer>', '<footer class="footer" id="contact">');
    }
  }

  fs.writeFileSync(filePath, result.join('\n'), 'utf8');
  console.log(`✅ ${page.file} updated`);
}

console.log('\n🎉 All pages rebuilt!');
