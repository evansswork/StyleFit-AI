import { garmentColors, type Style } from "../styling/engine";

export type Inspiration = {
  slug: string;
  title: string;
  drama: string;
  stylingNote: string;
  sourceUrl: string;
  style: Style;
  topColor: string | null;
  active: boolean;
};

export const rainInspiration: Inspiration = {
  slug: "sunrise-through-the-rain",
  title: "Sunrise Through the Rain Concept Idea",
  drama: "Sunshine Through the Rain",
  stylingNote: "Mulai dari kemeja putih yang rapi. Untuk padu padan kampus, coba celana gelap dan sneakers polos dari lemarimu.",
  sourceUrl: "https://www.netflix.com/id-en/title/83112494",
  style: "smart-casual",
  topColor: garmentColors.putih,
  active: true,
};
