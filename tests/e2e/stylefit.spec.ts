import { expect, test } from "@playwright/test";

test("landing changes items, respects locks and hands choices to the stylist without external requests", async ({ page }) => {
  const externalRequests: string[] = [];
  page.on("request", request => {
    const url = new URL(request.url());
    if (!["127.0.0.1", "localhost"].includes(url.hostname)) externalRequests.push(url.origin);
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Gaya yang kamu suka");
  await expect(page.getByText("Demo contoh", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Ganti atasan", exact: true }).click();
  await expect(page.getByRole("img", { name: "Ilustrasi Kaus biru", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Pertahankan atasan", exact: true }).click();
  await page.getByRole("button", { name: "Smart casual", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("masih terkunci");
  await expect(page.getByRole("button", { name: "Casual", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Sejuk", exact: true }).click();
  await expect(page.getByRole("img", { name: "Ilustrasi Jaket navy", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Lanjutkan pilihan ke stylist" }).click();
  await expect(page).toHaveURL(/top=tee-blue/);
  await expect(page).toHaveURL(/locked=top/);
  await expect(page.getByRole("button", { name: "Pertahankan Kaus biru", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Buat kombinasi" }).click();
  const cards = page.getByRole("article", { name: /Kombinasi/ });
  await expect(cards).toHaveCount(3);
  for (const card of await cards.all()) await expect(card).toContainText("Kaus biru");
  const secondPreview = page.getByRole("button", { name: "Lihat kombinasi 2", exact: true });
  await secondPreview.click();
  await expect(secondPreview).toHaveAttribute("aria-pressed", "true");
  const alternative = cards.nth(1);
  for (const item of await alternative.getByRole("listitem").all()) {
    const name = (await item.innerText()).split("·")[0].trim();
    await expect(page.locator("#outfit-preview").getByRole("img", { name: `Ilustrasi ${name}`, exact: true })).toBeVisible();
  }
  expect(externalRequests).toEqual([]);
});

test("guest can add, correct, lock, and use their own clothes; a reload clears the draft", async ({ page }) => {
  await page.goto("/stylist");
  await expect(page.getByText("Inspirasi gaya", { exact: true })).toBeVisible();
  await page.screenshot({ path: `test-results/stylist-empty-${test.info().project.name}.png`, fullPage: true });
  await expect(page.getByText("Draft sementara di tab ini.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Buat kombinasi" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Belum ada");
  const form = page.getByRole("form", { name: "Form pakaian" });
  for (const [name, category] of [["Kaus milikku", "top"], ["Celana milikku", "bottom"], ["Sepatu milikku", "shoes"]]) {
    await form.getByLabel("Nama pakaian", { exact: true }).fill(name);
    await form.getByRole("combobox", { name: "Kategori", exact: true }).selectOption(category);
    await form.getByRole("button", { name: "Tambahkan pakaian" }).click();
  }
  await page.getByRole("button", { name: "Edit Kaus milikku", exact: true }).click();
  await form.getByLabel("Nama pakaian", { exact: true }).fill("Kaus favorit");
  await form.getByRole("button", { name: "Simpan perubahan" }).click();
  await page.getByRole("button", { name: "Pertahankan Kaus favorit", exact: true }).click();
  await page.getByRole("button", { name: "Buat kombinasi" }).click();
  const result = page.getByRole("article", { name: "Kombinasi 1", exact: true });
  await expect(result).toContainText("Kaus favorit");
  await expect(result).toContainText("Tambahan belanja: Rp");
  await expect(result).toContainText("3 item berasal dari lemarimu");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: `test-results/stylist-${test.info().project.name}.png`, fullPage: true });
  await page.getByRole("button", { name: "Hapus Kaus favorit", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Lepaskan kunci");
  await page.getByRole("combobox", { name: "Konteks cuaca", exact: true }).selectOption("cool");
  await page.getByRole("button", { name: "Buat kombinasi" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("outer");
  await page.getByRole("link", { name: "StyleFit AI beranda", exact: true }).click();
  await page.getByRole("navigation", { name: "Navigasi utama" }).getByRole("link", { name: "Coba stylist", exact: true }).click();
  await expect(page.getByRole("button", { name: "Edit Kaus favorit", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Lemari masih kosong.", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }))).toEqual({ local: [], session: [] });
});

test("invalid query values recover to known items and keyboard controls work", async ({ page }) => {
  await page.goto("/stylist?demo=1&style=bad&weather=bad&top=unknown&locked=admin");
  await expect(page.getByRole("img", { name: "Ilustrasi Kaus putih", exact: true })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Gaya", exact: true })).toHaveValue("casual");
  await page.goto("/");
  await expect(page.getByRole("img", { name: /Dua orang dengan padu padan/ })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Lewati ke isi utama" })).toBeFocused();
  const styleButton = page.getByRole("button", { name: "Smart casual", exact: true });
  await styleButton.focus();
  await page.keyboard.press("Enter");
  await expect(styleButton).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("img", { name: "Ilustrasi Kemeja biru", exact: true })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Tropis", exact: true })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  if (test.info().project.name === "mobile-360") {
    expect(await styleButton.evaluate(element => getComputedStyle(element).transitionDuration)).toBe("0s");
  }
  await page.screenshot({ path: `test-results/landing-${test.info().project.name}.png`, fullPage: true, animations: "disabled" });
});
