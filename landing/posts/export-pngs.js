const puppeteer = require('puppeteer');
const path = require('path');

const files = [
  'ig-post.html',
  'ig-post-02.html',
  'ig-post-03.html',
  'ig-post-04.html',
  'ig-post-05.html',
];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });

  for (const file of files) {
    const filePath = 'file://' + path.resolve(__dirname, file);
    await page.goto(filePath, { waitUntil: 'networkidle0' });

    const canvas = await page.$('.canvas');
    const outName = file.replace('.html', '.png');
    await canvas.screenshot({ path: path.resolve(__dirname, outName) });
    console.log('Exported:', outName);
  }

  await browser.close();
  console.log('Done!');
})();
