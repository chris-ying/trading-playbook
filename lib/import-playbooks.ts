import "server-only";

import JSZip from "jszip";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const playbookDirectory = path.join(root, "playbooks");
const chartDirectory = path.join(root, "public", "charts");

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function importPlaybookZip(buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer);

  await fs.mkdir(playbookDirectory, { recursive: true });
  await fs.mkdir(chartDirectory, { recursive: true });

  const markdownFiles = Object.values(zip.files).filter(
    (entry) =>
      !entry.dir &&
      !entry.name.startsWith("__MACOSX/") &&
      !entry.name.includes("/._") &&
      entry.name.toLowerCase().endsWith(".md")
  );

  if (markdownFiles.length > 100) {
    throw new Error("Too many playbooks in ZIP");
  }

  let imported = 0;
  let images = 0;
  const warnings: string[] = [];

  for (const entry of markdownFiles) {
    const title = path.posix.basename(entry.name, ".md");
    const slug = createSlug(title);

    if (!slug) {
      continue;
    }

    const destination = path.join(
      playbookDirectory,
      `${slug}.md`
    );

    let markdown = await entry.async("string");
    markdown = markdown.replace(/^(\s*[-*+]\s+)\[[ xX]\]\s*/gm, "$1");

    const imageFolder = path.join(chartDirectory, slug);
    const noteFolder = path.posix.dirname(entry.name);

    await fs.rm(imageFolder, {
      recursive: true,
      force: true,
    });

    await fs.mkdir(imageFolder, { recursive: true });

    let imageNumber = 0;

    // Match Markdown images: ![description](path)
    const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const matches = [...markdown.matchAll(imagePattern)];

    for (const match of matches) {
      const originalPath = match[2];

      // Leave remote images unchanged.
      if (/^(https?:|data:|\/)/i.test(originalPath)) {
        continue;
      }

      const sourcePath = path.posix.normalize(
        path.posix.join(noteFolder, originalPath)
      );

      if (
        sourcePath.startsWith("../") ||
        sourcePath.includes("/../")
      ) {
        warnings.push(`Unsafe image path: ${originalPath}`);
        continue;
      }

      const imageEntry = zip.file(sourcePath);

      if (!imageEntry) {
        warnings.push(`Missing image: ${sourcePath}`);
        continue;
      }

      const extension = path.posix
        .extname(sourcePath)
        .toLowerCase();

      if (
        ![".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(
          extension
        )
      ) {
        warnings.push(`Unsupported image: ${sourcePath}`);
        continue;
      }

      const imageData = await imageEntry.async("nodebuffer");

      if (imageData.length > 10 * 1024 * 1024) {
        warnings.push(`Image too large: ${sourcePath}`);
        continue;
      }

      await fs.mkdir(imageFolder, { recursive: true });

      imageNumber++;
      const imageName = `chart-${imageNumber}${extension}`;

      await fs.writeFile(
        path.join(imageFolder, imageName),
        imageData,
        { flag: "wx" }
      );

      const newReference = `![${match[1]}](/charts/${slug}/${imageName})`;

      markdown = markdown.replace(match[0], newReference);
      images++;
    }

    await fs.writeFile(destination, markdown);

    imported++;
  }

  return { imported, images, warnings };
}
