import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: process.env.EXE, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1200 } });
await ctx.addCookies([{ name: 'admin_token', value: process.env.ADMIN, url: 'http://localhost:3000' }]);
let failed = 0;
const check = (n, ok, e='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${ok?'':'   '+e}`); if(!ok) failed++; };

const page = await ctx.newPage();
page.on('pageerror', e => { console.log('PAGEERROR', e.message); failed++; });

// Admin order detail shows size
await page.goto(`http://localhost:3000/admin/orders/${process.env.ORDER}`, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
let t = await page.locator('body').innerText();
check('admin order detail shows Size: M', /Size: M/.test(t), t.slice(0,300));
check('admin order detail shows correct line total 24,000', /24,000/.test(t));

// Admin products list shows "3 sizes" pill
await page.goto('http://localhost:3000/admin/products?search=__test_sized_shirt__', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
t = await page.locator('body').innerText();
check('admin products list shows "3 sizes" pill', /3 sizes/.test(t), t.slice(0,300));

// Admin edit page: load, verify size rows populated, edit, save, reload, verify persisted
await page.goto(`http://localhost:3000/admin/products/${process.env.PID}`, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
const labelInputs = page.locator('input[placeholder="e.g. M, 500ml"]');
check('edit page loads 3 size rows', await labelInputs.count() === 3, String(await labelInputs.count()));
check('first row label is S', await labelInputs.nth(0).inputValue() === 'S');

// add a new size row
await page.locator('button', { hasText: 'Add Size' }).click();
await page.waitForTimeout(300);
const newLabelInputs = page.locator('input[placeholder="e.g. M, 500ml"]');
await newLabelInputs.nth(3).fill('XL');
const stockInputs = page.locator('input[placeholder="0"]');
await stockInputs.nth(3).fill('7');
await page.locator('button', { hasText: 'Save Changes' }).first().click();
await page.waitForTimeout(1500);

await page.goto(`http://localhost:3000/admin/products/${process.env.PID}`, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
t = await page.locator('body').innerText();
const afterLabels = page.locator('input[placeholder="e.g. M, 500ml"]');
check('edit page now has 4 size rows after save+reload', await afterLabels.count() === 4, String(await afterLabels.count()));
check('4th row is the new XL size', await afterLabels.nth(3).inputValue() === 'XL');

await browser.close();
console.log(failed ? `\n${failed} FAILED` : '\nALL PASS');
