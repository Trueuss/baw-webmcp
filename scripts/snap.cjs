// Snap screenshots of the running dev server, both locales.
// Run: node scripts/snap.cjs
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

const OUT = path.join(__dirname, '..', 'public', 'demo');

const SHOTS = (prefix, base) => [
  { name: `${prefix}-01-home.png`,     url: `${base}/`,          width: 1440, height: 900, full: true  },
  { name: `${prefix}-02-stylelab.png`, url: `${base}/stylelab`,  width: 1440, height: 900, full: true  },
  { name: `${prefix}-03-stylist.png`,  url: `${base}/stylist`,   width: 1440, height: 900, full: true  },
  { name: `${prefix}-04-tools.png`,    url: `${base}/tools`,     width: 1440, height: 900, full: true  },
  { name: `${prefix}-05-lookbook.png`, url: `${base}/lookbook`,  width: 1440, height: 900, full: true  },
  { name: `${prefix}-06-home-fold.png`,url: `${base}/`,          width: 1440, height: 900, full: false }
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  const exe = CHROME_PATHS.find((p) => fs.existsSync(p));
  if (!exe) {
    console.error('No Chrome or Edge binary found.');
    process.exit(1);
  }
  console.log('Browser:', exe);

  const browser = await puppeteer.launch({
    executablePath: exe,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    for (const [prefix, base] of [['zh', 'http://localhost:3000'], ['en', 'http://localhost:3000/en']]) {
      for (const shot of SHOTS(prefix, base)) {
        const page = await browser.newPage();
        await page.setViewport({ width: shot.width, height: shot.height, deviceScaleFactor: 2 });
        const url = shot.url;
        console.log('->', url);
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
        await new Promise((r) => setTimeout(r, 1200));
        const out = path.join(OUT, shot.name);
        await page.screenshot({ path: out, fullPage: !!shot.full });
        await page.close();
        console.log('   wrote', shot.name, `(${fs.statSync(out).size} bytes)`);
      }
    }
  } finally {
    await browser.close();
  }
  console.log('done.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
