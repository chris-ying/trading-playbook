"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { importPlaybookZip } from "@/lib/import-playbooks";

export async function uploadPlaybooks(formData: FormData) {
  const file = formData.get("archive");

  if (!(file instanceof File)) {
    throw new Error("Please select a ZIP file.");
  }

  if (!file.name.toLowerCase().endsWith(".zip")) {
    throw new Error("Only ZIP files are supported.");
  }

  if (file.size > 20 * 1024 * 1024) {
    throw new Error("ZIP file exceeds 20 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await importPlaybookZip(buffer);

  revalidatePath("/playbooks");

  redirect(
    `/import?imported=${result.imported}&images=${result.images}`
  );
}