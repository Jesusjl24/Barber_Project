// End-to-end smoke test of the MiBarbero MVP flows.
// Usage: npm run build && npm run start -- -p 3100, then: npm run smoke
// Each run uses a fresh browser profile, so localStorage starts from seed data.
import { chromium } from "playwright";

const BASE = process.env.SMOKE_BASE_URL || "http://localhost:3100";
const results = [];
function check(name, ok, extra = "") {
  results.push({ name, ok, extra });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`);
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

// 1. Home renders
await page.goto(BASE, { waitUntil: "networkidle" });
check("home renders hero", await page.getByText("Know before you go.").isVisible());
check("home lists Luis", await page.getByText("Luis “Fade King” Ramirez").first().isVisible());

// 2. Language toggle
await page.getByRole("button", { name: "ES" }).click();
await page.waitForTimeout(300);
check("ES toggle switches copy", await page.getByText("Entérate antes de llegar.").isVisible());
await page.getByRole("button", { name: "EN" }).click();
await page.waitForTimeout(300);

// 3. Barber profile
await page.goto(`${BASE}/b/luis`, { waitUntil: "networkidle" });
check("profile shows status pill", await page.getByText("Available now").first().isVisible());
check("profile shows wait", await page.getByText(/Estimated wait/).first().isVisible());
check("profile shows services", await page.getByText("Skin Fade").first().isVisible());
const before = await page.getByText(/people waiting|person waiting/).first().textContent();

// 4. Join queue flow
await page.getByRole("link", { name: "Join Queue" }).click();
await page.waitForURL("**/queue");
await page.locator("#q-name").fill("Test Customer");
await page.locator("#q-phone").fill("5555550100");
await page.getByRole("radio", { name: /Men’s Cut/ }).click();
await page.getByRole("radio", { name: "Zelle" }).click();
await page.getByRole("button", { name: "Join Queue" }).click();
await page.waitForTimeout(500);
check("queue confirmation shows", await page.getByText("You’re in line").first().isVisible());
check("queue shows position", await page.getByText(/#\d+ of \d+/).first().isVisible());
check("MVP SMS note visible", await page.getByText(/SMS\/WhatsApp reminders/).isVisible());

// 5. Queue count updated on profile
await page.goto(`${BASE}/b/luis`, { waitUntil: "networkidle" });
const after = await page.getByText(/people waiting|person waiting/).first().textContent();
check("queue count updated", before !== after, `${before} -> ${after}`);
check("in-line banner on profile", await page.getByText("View my spot").isVisible());

// 6. Persistence across reload
await page.reload({ waitUntil: "networkidle" });
check("queue state persists after reload", await page.getByText("View my spot").isVisible());

// 7. Booking flow
await page.goto(`${BASE}/b/luis/book`, { waitUntil: "networkidle" });
await page.getByRole("radio", { name: /Cut \+ Beard/ }).click();
// pick tomorrow to guarantee open slots
await page.getByRole("button", { name: /Tomorrow/ }).click();
await page.waitForTimeout(300);
const slot = page.locator("form button[aria-pressed]").filter({ hasText: /:\d\d/ }).first();
await slot.click();
await page.locator("#b-name").fill("Test Booker");
await page.locator("#b-phone").fill("5555550100");
await page.getByRole("radio", { name: "Cash", exact: true }).click();
await page.getByRole("button", { name: "Confirm Booking" }).click();
await page.waitForTimeout(500);
check("booking confirmed", await page.getByText("Booking confirmed").isVisible());

// 8. My visits shows both
await page.goto(`${BASE}/me`, { waitUntil: "networkidle" });
check("my visits shows queue spot", await page.getByText("You’re in line").first().isVisible());
check("my visits shows booking", await page.getByText("Upcoming booking").isVisible());

// 9. No public ratings/reviews surface (PRD non-goal)
await page.goto(`${BASE}/b/luis`, { waitUntil: "networkidle" });
check("no star rating shown on profile", (await page.getByText(/★\s*4\.\d/).count()) === 0);
check("no reviews route", (await page.goto(`${BASE}/b/luis/reviews`)).status() === 404);

// 10. Dashboard: status, wait, queue management
await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Busy" }).click();
await page.waitForTimeout(300);
check("dashboard status change reflects", (await page.locator('section >> text=Busy').count()) > 0);
await page.getByRole("button", { name: "+5 min" }).click();
await page.waitForTimeout(200);
check("wait time shows 30", await page.getByText("30", { exact: false }).first().isVisible());
// mark Test Customer in chair, then complete
const entryCard = page.locator(".card", { hasText: "Test Customer" }).first();
await entryCard.getByRole("button", { name: /In chair/ }).click();
await page.waitForTimeout(300);
await entryCard.getByRole("button", { name: /Mark Complete/ }).click();
await page.waitForTimeout(300);
check("entry completed & removed from live queue", (await page.locator(".card", { hasText: "Test Customer" }).count()) === 0);
// add walk-in
await page.getByPlaceholder("Walk-in name").fill("Walkin Willy");
await page.locator("select").first().selectOption({ index: 1 });
await page.getByRole("button", { name: "Add", exact: true }).click();
await page.waitForTimeout(300);
check("walk-in added to queue", await page.getByText("Walkin Willy").isVisible());

// 11a. Shop search (city/state/ZIP)
await page.goto(`${BASE}/shop`, { waitUntil: "networkidle" });
check("search lists both shops", (await page.getByRole("link", { name: "View Shop" }).count()) === 2);
await page.getByRole("searchbox").fill("07087");
await page.waitForTimeout(300);
check("ZIP search narrows to Quisqueya", (await page.getByRole("link", { name: "View Shop" }).count()) === 1 && await page.getByText("Quisqueya Barbershop").isVisible());
await page.getByRole("searchbox").fill("Nowhere OK");
await page.waitForTimeout(300);
check("no-results state shows", await page.getByText(/No shops found/).isVisible());

// 11b. Shop front-door page
await page.goto(`${BASE}/shop/shop-caribe`, { waitUntil: "networkidle" });
check("shop shows Caribe Cuts", await page.getByText("Caribe Cuts").first().isVisible());
check("shop shows 3 barbers", (await page.getByRole("link", { name: "View Barber" }).count()) === 3);
check("front door footer credit", await page.getByText("Powered by").isVisible());

// 11c. Client book + CSV export (barber dashboard)
await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
await page.getByText("My Clients").scrollIntoViewIfNeeded();
const [download] = await Promise.all([
  page.waitForEvent("download"),
  page.getByRole("button", { name: "Export CSV" }).click(),
]);
check("client CSV downloads", (download.suggestedFilename() ?? "").endsWith(".csv"));

// 11d. Owner dashboard
await page.goto(`${BASE}/owner`, { waitUntil: "networkidle" });
check("owner shows aggregate stats", await page.getByText("In line now").isVisible());
check("owner shows roster", (await page.getByRole("link", { name: "View Barber" }).count()) === 3);
await page.getByRole("button", { name: "Quisqueya Barbershop" }).click();
await page.waitForTimeout(300);
check("owner can switch shops", (await page.getByRole("link", { name: "View Barber" }).count()) === 2);

// 12. Admin metrics
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
check("metrics shows queue joins", await page.getByText("Queue joins").isVisible());
check("pilot criteria visible", await page.getByText("Pilot success criteria").isVisible());
check("barber activation shows active", await page.getByText("Active", { exact: false }).first().isVisible());

// 13. Not-working barber queue closed
await page.goto(`${BASE}/b/jay/queue`, { waitUntil: "networkidle" });
check("jay queue closed state", await page.getByText("The line is closed right now").isVisible());

check("no page errors", errors.length === 0, errors.join(" | ").slice(0, 300));

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
