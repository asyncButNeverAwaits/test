const { chromium } = require("playwright");
const fs = require("fs");
const { execSync } = require("child_process");

(async () => {
  console.log("🔎 Start Script Execution");

  // safer headless mode for CI
  const browser = await chromium.launch({
    headless: false,
    args: ["--disable-http2"]
  });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  });

  const page = await context.newPage();
  console.log("🌐 Navigating to page...");
  const encoded = 'aHR0cHM6Ly93d3cuY21lZ3JvdXAuY29tL21hcmtldHMvZXF1aXRpZXMvbmFzZGFxL2UtbWluaS1uYXNkYXEtMTAwLnF1b3Rlcy5odG1s';
  function decode(b64){ return Buffer.from(b64,'base64').toString('utf8') }
  await page.goto(decode(encoded), { waitUntil: 'networkidle' });

  console.log("✅ Page loaded, selecting rows...");
  await page.waitForSelector("tbody > tr", { timeout: 30000 });
  const rows = await page.$$("tbody > tr");
  console.log("📦 Rows found:", rows.length);

  const results = [];

  for (let i = 0; i < rows.length; i++) {
    try {
      const monthEl = await rows[i].$("td:first-child");
      const openingEl = await rows[i].$("td:nth-child(6) > div");

      if (!monthEl || !openingEl) {
        console.warn(`⚠️ Missing elements in row ${i}`);
        continue;
      }

      const monthText = (await monthEl.innerText()).trim();
      const openingText = (await openingEl.innerText()).trim();

      console.log(`📝 Row ${i}:`, { monthText, openingText });

      const monthCode = monthText.split("\n")[1] || "";
      const openingPrice = Number(openingText) || 0;

      results.push({ month: monthCode, opening: openingPrice });
    } catch (err) {
      console.error(`❌ Error on row ${i}:`, err);
    }
  }

  console.log("📦 Final data:", results);

  // 📂 Create dated folder and save file
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const dirPath = `${today}`;
  const filePath = `${dirPath}/data.json`;

  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(results, null, 2));

  console.log(`✅ Data saved to ${filePath}`);

  // await page.screenshot({ path: "debug.png", fullPage: true });


  await browser.close();

  // 📤 Commit & push back to repo
  try {
    execSync("git config user.name 'github-actions[bot]'");
    execSync("git config user.email 'github-actions[bot]@users.noreply.github.com'");
    execSync(`git add "${filePath}"`);
    execSync(`git commit -m "Add data for ${today}" || echo "No changes to commit"`);
    execSync("git push");
    console.log("✅ Data committed & pushed to repository");
  } catch (err) {
    console.error("❌ Git push failed:", err.message);
  }
})();
