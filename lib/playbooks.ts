import fs from "node:fs/promises";
import path from "node:path";

export type Playbook = {
  slug: string;
  title: string;
  content: string;
  thumbnail: string | null;
};

const directory = path.join(process.cwd(), "playbooks");

export async function getPlaybooks(): Promise<Playbook[]> {
  
  const files = await fs.readdir(directory);

  const playbooks = await Promise.all(
    files
      .filter((file) => file.endsWith(".md"))
      .map(async (file) => {
        const slug = file
        .replace(/\.md$/i, "")
        .toLowerCase()
        .replace(/\s+/g, "-");

        const content = await fs.readFile(
          path.join(directory, file),
          "utf-8"
        );

        const title =
          content.match(/^#\s+(.+)$/m)?.[1] ??
          slug.replaceAll("-", " ").toUpperCase();

        const thumbnail = content.match(
          /!\[[^\]]*\]\((\/charts\/[^)\s]+)\)/
        )?.[1] ?? null;

        return {
          slug,
          title,
          content,
          thumbnail,
        };
      })
  );

  return playbooks.sort((a, b) =>
    a.title.localeCompare(b.title)
  );
}

export async function getPlaybook(slug: string) {
  const playbooks = await getPlaybooks();

  return playbooks.find((playbook) => playbook.slug === slug);
}
