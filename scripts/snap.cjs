// Snap screenshots of the running dev server using system Chrome.
// Run: node scripts/snap.cjs
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
];

const BASE = process.env.BAW_URL || 'http://localhost:3000';
const OUT = path.join(__dirname, '..', 'public', 'demo');

const SHOTS = [
  { name: '01-home.png',       url: '/',         width: 1440, height: 900,  full: true  },
  { name: '02-stylelab.png',   url: '/stylelab', width: 1440, height: 900,  full: true  },
  { name: '03-stylist.png',    url: '/stylist',  width: 1440, height: 900,  full: true  },
  { name: '04-tools.png',      url: '/tools',    width: 1440, height: 900,  full: true  },
  { name: '05-lookbook.png',   url: '/lookbook', width: 1440, height: 900,  full: true  },
  { name: '06-home-fold.png',  url: '/',         width: 1440, height: 900,  full: false }
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  const exe = CHROME_PATHS.find((p) => fs.existsSync(p));
  if (!exe) {
    console.error('No Chrome or Edge binary found. Tried:', CHROME_PATHS);
    process.exit(1);
  }
  console.log('Using browser:', exe);

  const browser = await puppeteer.launch({
    executablePath: exe,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    for (const shot of SHOTS) {
      const page = await browser.newPage();
      await page.setViewport({ width: shot.width, height: shot.height, deviceScaleFactor: 2 });
      const url = BASE + shot.url;
      console.log('->', url);
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      // Let any client-side hydration settle
      await new Promise((r) => setTimeout(r, 1200));
      const out = path.join(OUT, shot.name);
      await page.screenshot({ path: out, fullPage: !!shot.full });
      await page.close();
      const size = fs.statSync(out).size;
      console.log('   wrote', shot.name, `(${size} bytes)`);
    }
  } finally {
    await browser.close();
  }
  console.log('done.');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
