"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { rainInspiration, type Inspiration } from "@/features/inspiration/catalog";
import { garmentColors } from "@/features/styling/engine";
import { currentCatalogAdmin } from "./inspiration";
import { inspiration } from "./schema";

export async function saveInspiration(expectedAccount: string, input: Inspiration, create: boolean) {
  if (!input || typeof input !== "object"
    || typeof input.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug) || input.slug.length > 64
    || typeof input.title !== "string" || !input.title.trim() || input.title.trim().length > 90
    || typeof input.drama !== "string" || !input.drama.trim() || input.drama.trim().length > 90
    || typeof input.stylingNote !== "string" || !input.stylingNote.trim() || input.stylingNote.trim().length > 280
    || typeof input.sourceUrl !== "string" || input.sourceUrl.length > 350
    || !["casual", "smart-casual"].includes(input.style) || typeof input.active !== "boolean"
    || (input.topColor !== null && !Object.values(garmentColors).includes(input.topColor))) {
    return { error: "Periksa judul, slug, gaya, dan catatan inspirasi." };
  }
  const source = URL.parse(input.sourceUrl);
  if (!source || source.protocol !== "https:" || source.username || source.password) {
    return { error: "Masukkan tautan sumber HTTPS yang valid." };
  }

  try {
    const admin = await currentCatalogAdmin();
    if (!admin || admin.user.id !== expectedAccount) return { error: "Akses admin diperlukan." };
    const updates = { title: input.title.trim(), drama: input.drama.trim(), stylingNote: input.stylingNote.trim(),
      sourceUrl: source.href, style: input.style, active: input.active, topColor: input.topColor };
    if (create) {
      if (input.slug === rainInspiration.slug) return { error: "Slug sudah dipakai. Edit inspirasi yang ada." };
      const inserted = await admin.db.insert(inspiration).values({ slug: input.slug, ...updates })
        .onConflictDoNothing().returning({ slug: inspiration.slug });
      if (!inserted.length) return { error: "Slug sudah dipakai. Edit inspirasi yang ada." };
    } else if (input.slug === rainInspiration.slug) {
      await admin.db.insert(inspiration).values({ slug: input.slug, ...updates })
        .onConflictDoUpdate({ target: inspiration.slug, set: updates });
    } else {
      const updated = await admin.db.update(inspiration).set(updates).where(eq(inspiration.slug, input.slug))
        .returning({ slug: inspiration.slug });
      if (!updated.length) return { error: "Inspirasi sudah tidak tersedia." };
    }
    revalidatePath("/inspirasi");
    return { error: null };
  } catch {
    return { error: "Inspirasi belum tersimpan. Coba lagi." };
  }
}
