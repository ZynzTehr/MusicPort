
import puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ffmpegPath = require('ffmpeg-static');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '../../');
const OUTPUT_DIR = path.resolve(PROJECT_ROOT, 'assets-readme/gifs');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 16:9 Aspect Ratio for standard video
const VIEWPORT = { width: 1280, height: 720 };

const config = {
  followNewTab: false,
  fps: 30,
  ffmpeg_Path: ffmpegPath || null, 
  videoFrame: {
    width: 1280,
    height: 720,
  },
  aspectRatio: '16:9',
};

async function recordScenario(browser, name, action) {
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  console.log(`Starting recording for: ${name}`);
  const recorder = new PuppeteerScreenRecorder(page, config);
  const outputPath = path.join(OUTPUT_DIR, `${name}.mp4`);

  await recorder.start(outputPath);
  try {
    await action(page);
  } catch (err) {
    console.error(`Error in scenario ${name}:`, err);
  } finally {
    await recorder.stop();
    await page.close();
    console.log(`Finished recording: ${name} -> ${outputPath}`);
  }
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Visible browser
    defaultViewport: null,
    args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    // 1. Auth Flow
    await recordScenario(browser, 'auth_flow', async (page) => {
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 1500));

      // Click Login/Join
      // Based on previous interaction: "Join / Sign In" button
      const loginBtn = await page.$('button.btn-primary') ||
                       (await page.$x("//button[contains(., 'Sign In')]"))[0] ||
                       (await page.$x("//button[contains(., 'Join')]"))[0];

      if (loginBtn) {
          await loginBtn.click();
          await new Promise(r => setTimeout(r, 1500));
      }

      // Simulate typing invalid then valid
      const emailSelector = 'input[placeholder="Email Address"]';
      const passSelector = 'input[placeholder="Password"]';
      const submitSelector = 'button.submit-btn'; // Adjust based on earlier findings (btn-dark?)

      // If modal is open
      if (await page.$(emailSelector)) {
          // Type User Email
          await page.type(emailSelector, 'user@example.com', { delay: 30 });
          await page.type(passSelector, 'password', { delay: 30 });
          await new Promise(r => setTimeout(r, 1000));

          // Clear
          await page.evaluate((sel) => document.querySelector(sel).value = '', emailSelector);
          await page.evaluate((sel) => document.querySelector(sel).value = '', passSelector);

          // Type Admin Email
          await page.type(emailSelector, 'admin@musicport.com', { delay: 30 });
          await page.type(passSelector, 'admin123', { delay: 30 });
          await new Promise(r => setTimeout(r, 1000));

          // Click Login
          const submitBtn = await page.$(submitSelector) || await page.$('button[type="submit"]');
          if (submitBtn) await submitBtn.click();

          // Wait for redirect
          try {
            await page.waitForNavigation({ timeout: 5000, waitUntil: 'networkidle0' });
          } catch (e) { console.log("Navigation timeout or already handled"); }
      }
      await new Promise(r => setTimeout(r, 2000));
    });

    // 2. Admin Dashboard
    await recordScenario(browser, 'admin_dashboard', async (page) => {
      // Direct navigation if session persisted, or login again
      await page.goto('http://localhost:5173/api/users/login', { waitUntil: 'networkidle0' }); // Attempt login route or just main
      await page.goto('http://localhost:5173/admin/dashboard', { waitUntil: 'networkidle0' });

      // Check if redirected to login, if so, login
      if (await page.$('input[placeholder="Email Address"]')) {
          await page.type('input[placeholder="Email Address"]', 'admin@musicport.com', { delay: 10 });
          await page.type('input[placeholder="Password"]', 'admin123', { delay: 10 });
          const btn = await page.$('button.submit-btn') || await page.$('button[type="submit"]');
          if (btn) {
              await btn.click();
              await page.waitForNavigation({ waitUntil: 'networkidle0' });
          }
      }

      await new Promise(r => setTimeout(r, 2000));

      // Scroll Dashboard
      await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
      await new Promise(r => setTimeout(r, 2000));

      // Sidebar Interaction
      // Selectors based on likely nav structure
      const usersLink = (await page.$x("//a[contains(., 'Users')]"))[0];
      if (usersLink) {
        await usersLink.click();
        await new Promise(r => setTimeout(r, 2000));
        await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
        await new Promise(r => setTimeout(r, 1500));
      }

      const productsLink = (await page.$x("//a[contains(., 'Products')]"))[0];
      if (productsLink) {
        await productsLink.click();
        await new Promise(r => setTimeout(r, 2000));
        await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
        await new Promise(r => setTimeout(r, 1500));
      }
    });

    // 3. Shows & Community
    await recordScenario(browser, 'shows_community', async (page) => {
      await page.goto('http://localhost:5173/shows', { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 2000));

      await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
      await new Promise(r => setTimeout(r, 2000));

      // Chat / Community
      const chatLink = (await page.$x("//a[contains(., 'Community')]"))[0] ||
                       (await page.$x("//a[contains(., 'Chat')]"))[0];
      if (chatLink) {
          await chatLink.click();
          await new Promise(r => setTimeout(r, 3000));
          // Type a message if input exists
          const chatInput = await page.$('input[placeholder*="message"]');
          if (chatInput) {
              await page.type('input[placeholder*="message"]', 'Hello MusicPort community!', { delay: 50 });
              await new Promise(r => setTimeout(r, 1000));
          }
      }
    });

    // 4. Shop Demo
    await recordScenario(browser, 'shop_demo', async (page) => {
      await page.goto('http://localhost:5173/shop', { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 3000));

      await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
      await new Promise(r => setTimeout(r, 2000));

      // Hover over first product
      await page.mouse.move(300, 400); // Approximate location
      await new Promise(r => setTimeout(r, 1000));

      // Click first product link/card
      const product = await page.$('.card') || await page.$('article');
      if (product) {
          await product.click();
          await new Promise(r => setTimeout(r, 2000));

          // Add to cart
          const addBtn = await page.$('button.add-to-cart') || (await page.$x("//button[contains(., 'Add to Cart')]"))[0];
          if (addBtn) {
              await addBtn.click();
              await new Promise(r => setTimeout(r, 1500));
          }
      }
    });

  } catch (err) {
    console.error("Global Error:", err);
  } finally {
    await browser.close();
  }
})();
