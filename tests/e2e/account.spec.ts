import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const mailpit = "http://127.0.0.1:8025/api/v1";
const password = "Stylefit-fixture-password-2026";
type Mail = { ID: string; Subject: string; To: { Address: string }[] };

async function emailLink(request: APIRequestContext, to: string, subject: string) {
  let match: Mail | undefined;
  await expect.poll(async () => {
    const res = await request.get(mailpit + "/search", { params: { query: "to:" + to } });
    expect(res.ok()).toBe(true);
    const { messages } = await res.json() as { messages: Mail[] };
    match = messages.find(message => message.Subject === subject && message.To.some(recipient => recipient.Address === to));
    return Boolean(match);
  }).toBe(true);
  const res = await request.get(mailpit + "/message/" + match!.ID);
  expect(res.ok()).toBe(true);
  const { Text } = await res.json() as { Text: string };
  const link = Text.trim().split(/\s+/).at(-1)!;
  expect(new URL(link).origin).toBe("http://127.0.0.1:3100");
  return link;
}

async function register(page: Page, request: APIRequestContext, email: string) {
  await page.getByRole("button", { name: "Buat akun", exact: true }).click();
  await page.getByLabel("Nama", { exact: true }).fill("Uji StyleFit");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Kata sandi", { exact: true }).fill(password);
  await page.getByRole("form", { name: "Buat akun", exact: true }).getByRole("button", { name: "Buat akun", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Cek tautan verifikasi");

  const verification = await emailLink(request, email, "Verifikasi akun StyleFit");
  expect((await page.request.get(verification)).ok()).toBe(true);
}

async function logIn(page: Page, email: string, secret = password) {
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Kata sandi", { exact: true }).fill(secret);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Lemariku", exact: true })).toBeVisible();
}

test("an account keeps wardrobe, looks, and feedback private across visits", async ({ page, browser, request }) => {
  await page.goto("/stylist");
  await page.getByLabel("Nama pakaian", { exact: true }).fill("Kemeja pribadi");
  await page.getByRole("button", { name: "Tambahkan pakaian" }).click();
  await page.getByRole("link", { name: "Masuk untuk menyimpan lemari" }).click();

  const email = process.env.STYLEFIT_ADMIN_EMAIL!;
  await register(page, request, email);
  await logIn(page, email);
  await expect(page.getByText("Kemeja pribadi", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Simpan 1 item dari draft guest" }).click();
  await expect(page.getByRole("button", { name: "Edit Kemeja pribadi" })).toBeVisible();
  await expect(page.getByRole("button", { name: /item dari draft guest/ })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("button", { name: "Edit Kemeja pribadi" })).toBeVisible();

  await page.getByRole("button", { name: "Edit Kemeja pribadi" }).click();
  await page.getByLabel("Nama pakaian", { exact: true }).fill("Kemeja akun pertama");
  await page.getByRole("button", { name: "Simpan perubahan" }).click();
  await expect(page.getByRole("button", { name: "Edit Kemeja akun pertama" })).toBeVisible();

  for (const [name, slot] of [["Celana akun pertama", "bottom"], ["Sepatu akun pertama", "shoes"]]) {
    await page.getByLabel("Nama pakaian", { exact: true }).fill(name);
    await page.getByRole("combobox", { name: "Kategori", exact: true }).selectOption(slot);
    await page.getByRole("button", { name: "Tambahkan pakaian" }).click();
    await expect(page.getByRole("button", { name: "Edit " + name })).toBeVisible();
  }
  await page.getByRole("button", { name: "Buat kombinasi" }).click();
  await page.getByRole("button", { name: "Simpan ke lookbook" }).click();
  await page.getByRole("link", { name: "Buka lookbook" }).click();
  await expect(page.getByRole("article")).toContainText("Kemeja akun pertama");
  await page.getByRole("combobox", { name: "Status", exact: true }).selectOption("worn");
  await page.getByLabel("Catatan (opsional)").fill("Nyaman dipakai");
  await page.getByRole("button", { name: "Simpan umpan balik" }).click();
  await expect(page.getByRole("status")).toContainText("Umpan balik tersimpan");
  await page.reload();
  await expect(page.getByRole("combobox", { name: "Status", exact: true })).toHaveValue("worn");
  await expect(page.getByLabel("Catatan (opsional)")).toHaveValue("Nyaman dipakai");

  const other = await browser.newContext();
  try {
    const second = await other.newPage();
    await second.goto("/akun");
    const secondEmail = "other-" + crypto.randomUUID() + "@example.test";
    await register(second, request, secondEmail);
    await logIn(second, secondEmail);
    await expect(second.getByText("Lemari masih kosong.", { exact: true })).toBeVisible();
    await expect(second.getByText("Kemeja akun pertama", { exact: true })).toHaveCount(0);
    await second.getByRole("link", { name: "Lookbook", exact: true }).click();
    await expect(second.getByRole("heading", { name: "Belum ada outfit tersimpan" })).toBeVisible();
    await second.goto("/admin/inspirasi");
    await expect(second.getByRole("heading", { name: "Akses admin diperlukan" })).toBeVisible();
    await expect(second.getByRole("form", { name: "Tambah inspirasi" })).toHaveCount(0);
  } finally {
    await other.close();
  }

  await page.getByRole("link", { name: "Kembali ke stylist" }).click();
  await page.getByRole("button", { name: "Hapus Kemeja akun pertama" }).click();
  await expect(page.getByRole("button", { name: "Edit Kemeja akun pertama" })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("button", { name: "Edit Kemeja akun pertama" })).toHaveCount(0);
  await page.getByRole("link", { name: "Lookbook", exact: true }).click();
  await expect(page.getByText("1 item sudah tidak tersedia di lemari.")).toBeVisible();
  await page.getByRole("button", { name: "Hapus dari lookbook" }).click();
  await expect(page.getByRole("status")).toContainText("Kombinasi dihapus");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Belum ada outfit tersimpan" })).toBeVisible();
  await page.getByRole("link", { name: "Kembali ke stylist" }).click();
  await page.getByRole("link", { name: "Profil", exact: true }).click();
  await page.getByLabel("Nama", { exact: true }).fill("Nama diperbarui");
  await page.getByLabel("Gaya awal").selectOption("smart-casual");
  await page.getByLabel("Cuaca awal").selectOption("cool");
  await page.getByRole("button", { name: "Simpan preferensi" }).click();
  await expect(page.getByRole("status")).toContainText("Preferensi tersimpan");
  await page.reload();
  await expect(page.getByLabel("Nama", { exact: true })).toHaveValue("Nama diperbarui");
  await page.getByRole("link", { name: "Kembali ke stylist" }).click();
  await expect(page.getByRole("combobox", { name: "Gaya", exact: true })).toHaveValue("smart-casual");
  await expect(page.getByRole("combobox", { name: "Konteks cuaca", exact: true })).toHaveValue("cool");
  await page.getByRole("link", { name: "Profil", exact: true }).click();
  await page.getByRole("link", { name: "Kelola inspirasi" }).click();
  const slug = "uji-" + crypto.randomUUID();
  const title = "Gaya kampus " + slug;
  const create = page.getByRole("form", { name: "Tambah inspirasi" });
  await create.getByLabel("Slug", { exact: true }).fill(slug);
  await create.getByLabel("Judul inspirasi").fill(title);
  await create.getByLabel("Nama drama").fill("Drama fixture");
  await create.getByLabel("Ide padu padan").fill("Coba kemeja polos dari lemari.");
  await create.getByLabel("Tautan sumber").fill("https://example.test/drama");
  await create.getByRole("checkbox", { name: "Tampilkan di inspirasi" }).check();
  await create.getByRole("button", { name: "Simpan inspirasi" }).click();
  await expect(create.getByRole("status")).toContainText("Inspirasi tersimpan");
  await page.getByRole("link", { name: "Inspirasi", exact: true }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await page.goto("/admin/inspirasi");
  const editor = page.getByRole("form", { name: "Edit " + title });
  await editor.getByRole("checkbox", { name: "Tampilkan di inspirasi" }).uncheck();
  await editor.getByRole("button", { name: "Simpan inspirasi" }).click();
  await expect(editor.getByRole("status")).toContainText("Inspirasi tersimpan");
  await page.getByRole("link", { name: "Inspirasi", exact: true }).click();
  await expect(page.getByRole("heading", { name: title })).toHaveCount(0);
  await page.goto("/stylist?inspiration=" + slug);
  await expect(page.getByText("Inspirasi ini belum tersedia.")).toBeVisible();
  await page.getByLabel("Nama pakaian", { exact: true }).fill("Item khusus akun");
  await page.getByRole("button", { name: "Tambahkan pakaian" }).click();
  await expect(page.getByRole("button", { name: "Edit Item khusus akun" })).toBeVisible();
  await page.getByRole("button", { name: "Keluar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Lemari di tab ini", exact: true })).toBeVisible();
  await expect(page.getByText("Item khusus akun", { exact: true })).toHaveCount(0);
});

test("Mailpit reset link changes the password", async ({ page, request }) => {
  await page.goto("/akun");
  const email = "reset-" + crypto.randomUUID() + "@example.test";
  await register(page, request, email);
  await page.getByRole("button", { name: "Lupa kata sandi", exact: true }).click();
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByRole("form", { name: "Lupa kata sandi" }).getByRole("button", { name: "Lupa kata sandi" }).click();
  await expect(page.getByRole("status")).toContainText("tautan reset");
  await page.goto(await emailLink(request, email, "Atur ulang kata sandi StyleFit"));
  const nextPassword = "Another-fixture-password-2026";
  await page.getByLabel("Kata sandi", { exact: true }).fill(nextPassword);
  await page.getByRole("button", { name: "Atur ulang kata sandi", exact: true }).click();
  await expect(page.getByRole("button", { name: "Masuk", exact: true })).toBeVisible();
  await logIn(page, email, nextPassword);
});
