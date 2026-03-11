// lib/hero-slides.ts
import fs from "node:fs/promises";
import path from "node:path";

const ALLOWED_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif"]);

export async function getHeroSlides(): Promise<string[]> {
  const dir = path.join(process.cwd(), "public", "hero-preview");

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    const files = entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .filter((name) => ALLOWED_EXT.has(path.extname(name).toLowerCase()))
      // natural sort => 2 before 10
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
      .map((name) => encodeURI(`/hero-preview/${name}`));

    return files;
  } catch {
    
    return [];
  }
}
