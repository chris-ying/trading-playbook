"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deletePlaybook(slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Invalid playbook slug");
  }

  const root = process.cwd();

  const markdownPath = path.join(
    root,
    "playbooks",
    `${slug}.md`
  );

  const imageFolder = path.join(
    root,
    "public",
    "charts",
    slug
  );

  await fs.unlink(markdownPath);

  await fs.rm(imageFolder, {
    recursive: true,
    force: true,
  });

  revalidatePath("/playbooks");
  revalidatePath(`/playbooks/${slug}`);

  redirect("/playbooks");
}
