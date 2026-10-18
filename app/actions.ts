"use server";

import { searchPlaybooks } from "@/lib/semantic-search";

export async function matchScenarios(query: string) {
  const text = query.trim();

  if (!text || text.length > 1000) {
    throw new Error("Enter a description under 1,000 characters.");
  }

  return searchPlaybooks(text);
}
