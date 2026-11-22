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
  await expect(page.getByText("Sunrise Through the Rain Concept Idea", { exact: true })).toBeVisible();
  await page.screenshot({ path: `test-results/stylist-empty-${test.info().project.name}.png`, fullPage: true });
  await expect(page.getByText("Draft sementara di tab ini.", { exact: true })).toBeVisible();
  const createOutfit = page.getByRole("button", { name: "Buat kombinasi" });
  await createOutfit.click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Belum ada");
  const form = page.getByRole("form", { name: "Form pakaian" });
  expect((await createOutfit.boundingBox())!.y).toBeGreaterThan((await form.boundingBox())!.y);
  const category = form.getByRole("combobox", { name: "Kategori", exact: true });
  const readiness = page.getByRole("list", { name: "Kategori yang sesuai gaya dan cuaca" });
  const nameField = form.getByLabel("Nama pakaian", { exact: true });
  const detailsToggle = form.getByText("Detail gaya dan cuaca", { exact: true });
  const itemStyle = form.getByRole("combobox", { name: "Gaya yang cocok", exact: true });
  await expect(readiness.getByRole("listitem").filter({ hasText: "Belum siap" })).toHaveCount(3);
  await expect(itemStyle).toBeHidden();
  for (const [name, suggested] of [["Kaus milikku", "top"], ["Celana milikku", "bottom"], ["Sepatu milikku", "shoes"]]) {
    await expect(category).toHaveValue(suggested);
    await nameField.fill(name);
    await form.getByRole("button", { name: "Tambahkan pakaian" }).click();
  }
  await expect(readiness).not.toContainText("Belum siap");
  expect((await createOutfit.boundingBox())!.y).toBeLessThan((await form.boundingBox())!.y);
  await page.getByRole("button", { name: "Edit Kaus milikku", exact: true }).click();
  await expect(nameField).toBeFocused();
  await nameField.fill("Kaus favorit");
  await detailsToggle.press("Enter");
  await itemStyle.selectOption("casual");
  await form.getByRole("button", { name: "Simpan perubahan" }).click();
  const style = page.getByRole("combobox", { name: "Gaya", exact: true });
  await style.selectOption("smart-casual");
  await expect(readiness.getByRole("listitem").filter({ hasText: "Atasan" })).toContainText("Belum siap");
  await style.selectOption("casual");
  await expect(readiness).not.toContainText("Belum siap");
  await page.getByRole("button", { name: "Pertahankan Kaus favorit", exact: true }).click();
  await page.getByRole("button", { name: "Buat kombinasi" }).click();
  const result = page.getByRole("article", { name: "Kombinasi 1", exact: true });
  await expect(result).toContainText("Kaus favorit");
  await expect(result).toContainText("Tambahan belanja: Rp");
  await expect(result).toContainText("3 item berasal dari lemarimu");
  await page.getByRole("link", { name: "Lihat hasil outfit" }).press("Enter");
  await expect(page.getByRole("heading", { name: "Kombinasi untukmu" })).toBeFocused();
  await page.getByRole("link", { name: "Ubah pilihan" }).click();
  await expect(page.getByRole("heading", { name: "Lemari di tab ini" })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: `test-results/stylist-${test.info().project.name}.png`, fullPage: true });
  await page.getByRole("button", { name: "Hapus Kaus favorit", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Lepaskan kunci");
  await page.getByRole("combobox", { name: "Konteks cuaca", exact: true }).selectOption("cool");
  await expect(readiness.getByRole("listitem").filter({ hasText: "Outer" })).toContainText("Belum siap");
  await expect(category).toHaveValue("outer");
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
  const photo = page.getByRole("img", { name: /Dua orang berkemeja putih berbagi earphone/ });
  await expect(photo).toBeVisible();
  await expect(photo).toHaveAttribute("src", "/demo/sunrise-through-the-rain.png");
  await expect.poll(() => photo.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBe(640);
  const layout = await photo.evaluate(image => {
    const photoBox = image.getBoundingClientRect();
    const hero = image.closest(".hero")!.getBoundingClientRect();
    const header = document.querySelector(".site-header")!.getBoundingClientRect();
    return {
      photoRatio: photoBox.width / photoBox.height,
      leftOffset: Math.abs(hero.left - header.left),
      rightOffset: Math.abs(hero.right - header.right),
      animation: getComputedStyle(image.parentElement!).animationName,
    };
  });
  expect(layout.photoRatio).toBeCloseTo(16 / 9, 2);
  expect(layout.leftOffset).toBeLessThan(1);
  expect(layout.rightOffset).toBeLessThan(1);
  expect(layout.animation).toBe(test.info().project.name === "mobile-360" ? "none" : "photo-arrive");
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

test("guest can open a sourced inspiration and keep their own wardrobe in the stylist", async ({ page }) => {
  await page.goto("/stylist");
  const form = page.getByRole("form", { name: "Form pakaian" });
  await form.getByLabel("Nama pakaian", { exact: true }).fill("Kemeja dari lemariku");
  await form.getByRole("button", { name: "Tambahkan pakaian" }).click();
  await page.getByRole("link", { name: "Inspirasi", exact: true }).click();
  await page.getByRole("searchbox", { name: "Judul drama atau inspirasi" }).fill("Judul belum tersedia");
  await page.getByRole("button", { name: "Cari", exact: true }).click();
  await expect(page.getByRole("link", { name: "Buat gaya dari lemarimu" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sunrise Through the Rain Concept Idea" })).toHaveCount(0);
  const search = page.getByRole("searchbox", { name: "Judul drama atau inspirasi" });
  await search.fill("SUNSHINE");
  await search.press("Enter");
  await expect(page.getByRole("heading", { name: "Sunrise Through the Rain Concept Idea" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: `test-results/inspiration-${test.info().project.name}.png`, fullPage: true, animations: "disabled" });
  await expect(page.getByRole("link", { name: "Sumber judul" })).toHaveAttribute("href", "https://www.netflix.com/id-en/title/83112494");
  await page.getByRole("link", { name: "Coba gaya Smart casual" }).click();
  await expect(page.getByRole("combobox", { name: "Gaya", exact: true })).toHaveValue("smart-casual");
  await expect(page.getByText("Ide awal · Sunrise Through the Rain Concept Idea.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Edit Kemeja dari lemariku" })).toBeVisible();
});

test("shopping links use missing outfit categories without making price or ownership claims", async ({ page }) => {
  const externalRequests: string[] = [];
  page.on("request", request => {
    if (!["127.0.0.1", "localhost"].includes(new URL(request.url()).hostname)) externalRequests.push(request.url());
  });
  await page.goto("/stylist?inspiration=sunrise-through-the-rain");
  const recommend = page.getByRole("button", { name: "Buat kombinasi" });
  const shopping = page.getByText("Cari pelengkap di marketplace", { exact: true });
  await recommend.click();
  await shopping.click();
  await expect(page.getByText(/Harga, ongkir, dan stok perlu dicek/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Cari kemeja polos putih di Shopee" }))
    .toHaveAttribute("href", "https://shopee.co.id/search?keyword=kemeja%20polos%20putih");
  await expect(page.getByRole("link", { name: "Cari kemeja polos putih di Tokopedia" }))
    .toHaveAttribute("href", "https://www.tokopedia.com/search?st=product&q=kemeja%20polos%20putih");
  await expect(page.getByRole("article", { name: /Kombinasi/ })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: `test-results/shopping-${test.info().project.name}.png`, fullPage: true });
  const color = page.getByRole("combobox", { name: "Warna atasan dari inspirasi", exact: true });
  await color.selectOption({ label: "biru" });
  await expect(shopping).toHaveCount(0);
  await recommend.click();
  await shopping.click();
  await expect(page.getByRole("link", { name: "Cari kemeja polos biru di Shopee" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Cari kemeja polos putih di Shopee" })).toHaveCount(0);
  const form = page.getByRole("form", { name: "Form pakaian" });
  await form.getByLabel("Nama pakaian", { exact: true }).fill("Kemeja yang sudah ada");
  await form.getByRole("button", { name: "Tambahkan pakaian" }).click();
  await expect(shopping).toHaveCount(0);
  await recommend.click();
  await shopping.click();
  await expect(page.getByRole("link", { name: "Cari celana bahan lurus di Shopee" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Cari kemeja/ })).toHaveCount(0);
  expect(externalRequests).toEqual([]);
});

test("3D renders the chosen outfit and supports rotation, zoom, proportions, and layering", async ({ page }) => {
  const externalRequests: string[] = [];
  page.on("request", request => {
    const url = new URL(request.url());
    if (["http:", "https:"].includes(url.protocol) && !["127.0.0.1", "localhost"].includes(url.hostname)) {
      externalRequests.push(url.href);
    }
  });
  await page.goto("/stylist?demo=1&style=smart-casual&weather=cool");
  await page.getByRole("button", { name: "Buat kombinasi" }).click();
  const firstOutfit = page.getByRole("article", { name: "Kombinasi 1", exact: true });
  await expect(firstOutfit).toContainText("Cardigan abu");
  await page.getByRole("button", { name: "Avatar 3D", exact: true }).click();
  const avatar = page.getByRole("img", { name: /Avatar 3D dengan/ });
  const rotation = page.getByRole("slider", { name: "Rotasi avatar", exact: true });
  await expect(rotation).toHaveValue("22");
  await expect(page.getByText(/Model pakaian serupa/)).toBeVisible();
  const before = await avatar.screenshot();
  await rotation.press("End");
  await expect(rotation).toHaveValue("360");
  expect((await avatar.screenshot()).equals(before)).toBe(false);

  const outer = page.getByRole("checkbox", { name: "Tampilkan outer" });
  const layered = await avatar.screenshot();
  await outer.uncheck();
  expect((await avatar.screenshot()).equals(layered)).toBe(false);
  await expect(firstOutfit).toContainText("Cardigan abu");

  const differentLook = await avatar.screenshot();
  await page.getByRole("button", { name: "Lihat kombinasi 2" }).click();
  const secondOutfit = page.getByRole("article", { name: "Kombinasi 2", exact: true });
  const names = await secondOutfit.getByRole("listitem").allTextContents();
  for (const name of names) await expect(avatar).toHaveAccessibleName(new RegExp(name.trim()));
  expect((await avatar.screenshot()).equals(differentLook)).toBe(false);

  const zoom = page.getByRole("slider", { name: "Zoom", exact: true });
  await zoom.press("ArrowRight");
  await expect(zoom).toHaveValue("101");
  const height = page.getByRole("slider", { name: "Tinggi relatif", exact: true });
  const width = page.getByRole("slider", { name: "Lebar relatif", exact: true });
  await height.press("End");
  await width.press("Home");
  await expect(height).toHaveValue("110");
  await expect(width).toHaveValue("85");
  await page.getByRole("button", { name: "Reset tampilan 3D" }).click();
  await expect(height).toHaveValue("100");
  await expect(width).toHaveValue("100");
  await expect(outer).toBeChecked();
  const reference = page.getByRole("complementary", { name: "Referensi foto dan sumber avatar" });
  await expect(reference.getByRole("img")).toHaveAttribute("src", "/demo/sunrise-through-the-rain.png");
  await expect(reference.getByRole("link", { name: "CC0" })).toBeVisible();
  const outfitFrame = await avatar.screenshot();
  await page.getByRole("button", { name: "Detail celana" }).press("Enter");
  expect((await avatar.screenshot()).equals(outfitFrame)).toBe(false);
  const face = page.getByRole("button", { name: "Detail wajah", exact: true });
  await face.press("Enter");
  await expect(face).toHaveAttribute("aria-pressed", "true");
  const faceFrame = await avatar.screenshot({ path: `test-results/avatar-face-${test.info().project.name}.png` });
  expect(faceFrame.equals(outfitFrame)).toBe(false);
  await rotation.press("PageUp");
  await rotation.press("PageUp");
  expect((await avatar.screenshot()).equals(faceFrame)).toBe(false);
  await page.getByRole("button", { name: "Reset tampilan 3D" }).click();
  await expect(page.getByRole("button", { name: "Outfit lengkap", exact: true })).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.locator(".avatar-workspace").screenshot({ path: `test-results/avatar-${test.info().project.name}.png` });
  expect(externalRequests).toEqual([]);

  await avatar.evaluate(element => element.dispatchEvent(new Event("webglcontextlost")));
  await expect(page.getByRole("button", { name: "Ilustrasi 2D", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(secondOutfit).toBeVisible();
});

test("no WebGL keeps the outfit and its 2D preview available", async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, kind: string, options?: unknown) {
      return kind === "webgl2" ? null : Reflect.apply(getContext, this, [kind, options]);
    } as typeof getContext;
  });
  await page.goto("/stylist?demo=1");
  await page.getByRole("button", { name: "Avatar 3D", exact: true }).click();
  await expect(page.getByText(/Preview 3D tidak dapat dimuat/)).toBeVisible();
  await expect(page.getByRole("img", { name: "Ilustrasi Kaus putih" })).toBeVisible();
  await page.getByRole("button", { name: "Buat kombinasi" }).click();
  await expect(page.getByRole("article", { name: "Kombinasi 1", exact: true })).toBeVisible();
});

test("a missing studio asset preserves the photo and the 2D outfit", async ({ page }) => {
  await page.route("**/avatar/studio-wardrobe.glb", route => route.abort());
  await page.goto("/stylist?demo=1");
  await page.getByRole("button", { name: "Avatar 3D", exact: true }).click();
  await expect(page.getByText(/Preview 3D tidak dapat dimuat/)).toBeVisible();
  await expect(page.getByRole("img", { name: "Ilustrasi Kaus putih" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Referensi foto dan sumber avatar" }).getByRole("img")).toBeVisible();
});

test("a studio garment swap keeps the camera and locked pieces", async ({ page }) => {
  await page.goto("/stylist?demo=1&view=3d&locked=shoes");
  const avatar = page.getByRole("img", { name: /Avatar 3D dengan/ });
  const rotation = page.getByRole("slider", { name: "Rotasi avatar", exact: true });
  await expect(rotation).toHaveValue("22");
  await avatar.scrollIntoViewIfNeeded();
  const box = await avatar.boundingBox();
  if (!box) throw new Error("Studio canvas unavailable");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2);
  await page.mouse.up();
  await expect(rotation).not.toHaveValue("22");
  await rotation.press("PageUp");
  const angle = await rotation.inputValue();
  await page.getByText("Coba pakaian contoh", { exact: true }).click();
  const picker = page.locator(".studio-picker");
  await expect(picker.getByRole("button", { name: "Loafers hitam" })).toBeDisabled();
  await page.getByText("Bandingkan scan sepatu", { exact: true }).click();
  await expect(page.getByRole("button", { name: "Tampilkan scan produk" })).toBeDisabled();
  const before = await avatar.screenshot();
  await picker.getByRole("button", { name: "Kemeja putih" }).press("Enter");
  await expect(avatar).toHaveAccessibleName("Avatar 3D dengan Kemeja putih, Jeans indigo, Sneakers putih");
  expect((await avatar.screenshot()).equals(before)).toBe(false);
  await expect(rotation).toHaveValue(angle);
  await page.getByRole("button", { name: "Detail celana" }).click();
  const jeans = await avatar.screenshot();
  await picker.getByRole("button", { name: "Celana abu muda" }).click();
  await expect(avatar).toHaveAccessibleName("Avatar 3D dengan Kemeja putih, Celana abu muda, Sneakers putih");
  expect((await avatar.screenshot()).equals(jeans)).toBe(false);
  await expect(picker.getByRole("button", { name: "Celana abu muda" })).toHaveAttribute("aria-pressed", "true");
});

test("the demo compares a product scan and recovers when the scan fails", async ({ page }) => {
  const fetches: string[] = [];
  page.on("request", request => {
    if (request.url().endsWith("/avatar/adistar/scan.glb")) fetches.push(request.url());
  });
  await page.route("**/avatar/adistar/scan.glb", route => route.abort(), { times: 1 });
  await page.goto("/stylist?demo=1&view=3d");
  const canvas = page.getByRole("img", { name: /Avatar 3D dengan/ });
  const rotation = page.getByRole("slider", { name: "Rotasi avatar", exact: true });
  await page.getByText("Bandingkan scan sepatu", { exact: true }).click();
  const scan = page.getByRole("button", { name: "Tampilkan scan produk" });
  const side = page.getByRole("button", { name: "Samping", exact: true });
  await side.press("Enter");
  await expect(rotation).toHaveValue("90");
  await expect(side).toHaveAttribute("aria-pressed", "true");
  const template = await canvas.screenshot();
  expect(fetches).toHaveLength(0);

  await scan.click();
  await expect(page.getByText(/Scan sepatu gagal dimuat/)).toBeVisible();
  await expect(canvas).toHaveAccessibleName(/Sneakers putih/);
  await scan.click();
  await expect(scan).toHaveAttribute("aria-pressed", "true");
  await expect(canvas).toHaveAccessibleName("Avatar 3D dengan Kaus putih, Jeans indigo, Adidas Adistar Boost M");
  expect((await canvas.screenshot()).equals(template)).toBe(false);
  await expect(page.getByText(/Sepatu memakai scan produk F32290/)).toBeVisible();
  await page.getByRole("button", { name: "Tumit", exact: true }).click();
  await expect(rotation).toHaveValue("180");

  await scan.click();
  await expect(canvas).toHaveAccessibleName(/Sneakers putih/);
  await scan.click();
  await expect(scan).toHaveAttribute("aria-pressed", "true");
  expect(fetches).toHaveLength(2);
});

test("footwear sizing works in 2D and withholds a result for a scan without a chart", async ({ page }) => {
  const assetRequests: string[] = [];
  page.on("request", request => { if (request.url().endsWith(".glb")) assetRequests.push(request.url()); });
  await page.goto("/stylist?demo=1");
  const guide = page.locator("#panduan-ukuran");
  await guide.getByText("Panduan ukuran sepatu", { exact: true }).press("Enter");
  await expect(guide).toHaveAttribute("open", "");
  const input = guide.getByRole("textbox", { name: "Panjang kaki (cm)" });
  const size = guide.getByRole("button", { name: "Cek ukuran" });
  await size.click();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await input.fill("25,9");
  await input.press("Enter");
  await expect(guide.getByText("EU 42", { exact: true })).toBeVisible();
  await expect(guide.getByRole("link", { name: "Tabel ukuran Adidas" })).toBeVisible();

  await input.fill("26,1");
  await expect(guide.getByText("EU 42", { exact: true })).toHaveCount(0);
  await size.click();
  await expect(guide.getByText("Di antara dua ukuran", { exact: false })).toBeVisible();
  await expect(guide.getByText("EU 42 2/3", { exact: true })).toBeVisible();
  await input.fill("36");
  await size.click();
  await expect(guide.getByText(/di luar rentang tabel/)).toBeVisible();

  await guide.getByRole("combobox", { name: "Produk" }).selectOption("F32290");
  await expect(guide.getByText(/Panduan ukuran belum tersedia/)).toBeVisible();
  await expect(size).toHaveCount(0);
  await guide.getByRole("combobox", { name: "Produk" }).selectOption("ID8812");
  await expect(input).toHaveValue("36");
  await expect(guide.getByText(/di luar rentang tabel/)).toHaveCount(0);
  await page.reload();
  await guide.getByText("Panduan ukuran sepatu", { exact: true }).click();
  await expect(input).toHaveValue("");
  expect(assetRequests).toEqual([]);
});
