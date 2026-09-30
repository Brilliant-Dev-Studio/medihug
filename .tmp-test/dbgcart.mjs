import { chromium } from 'playwright-core';
const PID = process.env.PID;
const browser = await chromium.launch({ executablePath: process.env.EXE, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1200 } });
await ctx.addInitScript(() => localStorage.setItem('medihug_patient', JSON.stringify({ name: 'Size Tester', phone: '09_TEST_SIZE_1' })));
const page = await ctx.newPage();
page.on('pageerror', e => console.log('PAGEERROR', e.message));
await page.goto(`http://localhost:3000/patient/records/${PID}`, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1200);
const mBtn = page.locator('button:visible').filter({ hasText: 'M' }).first();
await mBtn.click();
await page.waitForTimeout(300);
const addBtn = page.locator('button:visible', { hasText: /Add to Cart|ဈေးခြင်းထဲ ထည့်မည်/ }).first();
await addBtn.click();
await page.waitForTimeout(800);
console.log('cart in localStorage:', await page.evaluate(() => localStorage.getItem('medihug_cart')));

await page.goto('http://localhost:3000/patient/cart', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
console.log('cart page body:', (await page.locator('body').innerText()).slice(0, 800));

const checkoutBtn = page.locator('button:visible', { hasText: /Checkout|အော်ဒါတင်မည်/ }).first();
await checkoutBtn.click();
await page.waitForTimeout(1500);
console.log('checkout URL:', page.url());
console.log('cart in localStorage on checkout:', await page.evaluate(() => localStorage.getItem('medihug_cart')));
console.log('checkout body:', (await page.locator('body').innerText()).slice(0, 1200));
await browser.close();
