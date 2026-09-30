import { chromium } from 'playwright-core';
const PID = process.env.PID;
const browser = await chromium.launch({ executablePath: process.env.EXE, headless: true });
let failed = 0;
const check = (n, ok, e='') => { console.log(`${ok?'PASS':'FAIL'}  ${n}${ok?'':'   '+e}`); if(!ok) failed++; };

const ctx = await browser.newContext({ viewport: { width: 1280, height: 1200 } });
await ctx.addInitScript(() => {
  localStorage.setItem('medihug_patient', JSON.stringify({ name: 'Size Tester', phone: '09_TEST_SIZE_1' }));
});
const page = await ctx.newPage();
page.on('pageerror', e => { console.log('PAGEERROR', e.message); failed++; });

/* 1) Product detail page: size picker present, L (out of stock) disabled, M selectable with its own price */
await page.goto(`http://localhost:3000/patient/records/${PID}`, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
let t = await page.locator('body').innerText();
check('size picker shows S/M/L', /\bS\b/.test(t) && /\bM\b/.test(t) && /\bL\b/.test(t));
check('base price shown for default-selected size S (10,000)', /10,000/.test(t));

const mBtn = page.locator('button:visible').filter({ hasText: 'M' }).first();
await mBtn.click();
await page.waitForTimeout(500);
t = await page.locator('body').innerText();
check('picking M updates price to 12,000', /12,000/.test(t));

const lBtn = page.locator('button:visible').filter({ hasText: 'L' }).first();
check('L (0 stock) button is disabled', await lBtn.isDisabled());

/* 2) Add M to cart, verify cart shows size + correct price */
await mBtn.click();
await page.waitForTimeout(300);
const addBtn = page.locator('button:visible', { hasText: /Add to Cart|ဈေးခြင်းထဲ ထည့်မည်/ }).first();
await addBtn.click();
await page.waitForTimeout(800);

await page.goto('http://localhost:3000/patient/cart', { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);
t = await page.locator('body').innerText();
check('cart shows the product with Size: M', /__test_sized_shirt__/.test(t) && /Size: M/.test(t));
check('cart shows M price 12,000', /12,000/.test(t));

/* 3) Checkout, place order */
const checkoutBtn = page.locator('button:visible', { hasText: /Checkout|အော်ဒါတင်မည်/ }).first();
await checkoutBtn.click();
await page.waitForTimeout(3000);
check('navigated to checkout with lines= param', page.url().includes('/patient/checkout?lines='), page.url());
t = await page.locator('body').innerText();
check('checkout item list shows size M', /__test_sized_shirt__/.test(t) && /Size: M/.test(t), t.slice(0, 600));

await page.waitForTimeout(500);
t = await page.locator('body').innerText();
check('amount to pay reflects 12,000 (single qty)', /12,000/.test(t));

await browser.close();
console.log(failed ? `\n${failed} FAILED` : '\nALL PASS');
