import "server-only";

import { pipeline } from "@huggingface/transformers";
import { getPlaybooks } from "./playbooks";

const modelPromise = pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2",
  { dtype: "q8" }
);

async function embed(text: string): Promise<number[]> {
  const model = await modelPromise;

  const result = await model(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(result.data as Float32Array);
}

function similarity(a: number[], b: number[]): number {
  return a.reduce((sum, value, index) => {
    return sum + value * b[index];
  }, 0);
}

export async function searchPlaybooks(query: string) {
  const playbooks = await getPlaybooks();

  const queryVector = await embed(query);

  const results = await Promise.all(
    playbooks.map(async (playbook) => {
      const text = `${playbook.title}\n${playbook.content}`;

      const vector = await embed(text);

      return {
        slug: playbook.slug,
        title: playbook.title,
        score: similarity(queryVector, vector),
      };
    })
  );

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, );
}
