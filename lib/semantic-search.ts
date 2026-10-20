import "server-only";

import OpenAI from "openai";
import { getPlaybooks } from "./playbooks";

const MODEL = "text-embedding-3-small";
const MAX_RESULTS = 5;
const MIN_SIMILARITY = 0.4;
const MAX_CONTENT_LENGTH = 6000;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function cleanContent(content: string): string {
  return content
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[[^\]]+\]\([^)]*\)/g, "")
    .replace(/[#*_`>]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_CONTENT_LENGTH);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let aNorm = 0;
  let bNorm = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    aNorm += a[i] * a[i];
    bNorm += b[i] * b[i];
  }

  return aNorm && bNorm ? dot / Math.sqrt(aNorm * bNorm) : 0;
}

export async function searchPlaybooks(query: string) {
  const playbooks = await getPlaybooks();
  if (playbooks.length === 0) return [];

  const normalizedQuery = normalize(query);
  const client = new OpenAI();

  // Embed all inputs in one API request to avoid a separate call for each playbook.
  const inputs = [
    query,
    ...playbooks.map((playbook) => playbook.title),
    ...playbooks.map(
      (playbook) => `${playbook.title}. ${cleanContent(playbook.content)}`
    ),
  ];

  const response = await client.embeddings.create({
    model: MODEL,
    input: inputs,
    encoding_format: "float",
  });

  const vectors = response.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);

  const queryVector = vectors[0];
  const count = playbooks.length;

  return playbooks
    .map((playbook, index) => {
      const title = normalize(playbook.title);
      const titleScore = cosineSimilarity(queryVector, vectors[1 + index]);
      const contentScore = cosineSimilarity(queryVector, vectors[1 + count + index]);

      let score = Math.max(0, Math.min(1, 0.65 * titleScore + 0.35 * contentScore));

      // Exact or partial title matches should outrank unrelated descriptions.
      if (title === normalizedQuery) {
        score = 1;
      } else if (normalizedQuery.length >= 4 && title.includes(normalizedQuery)) {
        score = Math.max(score, 0.85);
      }

      return {
        slug: playbook.slug,
        title: playbook.title,
        score,
      };
    })
    .filter((result) => result.score >= MIN_SIMILARITY)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS);
}