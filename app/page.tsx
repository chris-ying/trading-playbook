"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { matchScenarios } from "./actions";
import styles from "./page.module.css";

type Match = {
  slug: string;
  title: string;
  score: number;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Match[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSearch() {
    if (!query.trim()) return;

    startTransition(async () => {
      setError("");
      setResults([]);
      setSearched(false);

      try {
        const matches = await matchScenarios(query);

        const filteredMatches = matches
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        setResults(filteredMatches);
        setSearched(true);
      } catch {
        setError("Search failed. Please try again.");
      }
    });
  }

  return (
    <main className={styles.home}>

      <div className={styles.container}>

        <div className={styles.intro}>
          <h1>
            Trading <span>Playbooks</span>
          </h1>
        </div>

        <section className={styles.search}>
          <div className={styles.sectionHeader}>
            <h1>Playbook Matcher</h1>
            <span>AI SEMANTIC SEARCH</span>
          </div>

          <p className={styles.description}>
            Describe price action, indicators, and sequence of events.
          </p>

          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. QQQ gaps down below yesterday's green candle..."
            rows={5}
            maxLength={2000}
          />

          <div className={styles.searchFooter}>
            <button
              onClick={handleSearch}
              disabled={isPending || !query.trim()}
            >
              {isPending ? "Searching..." : "Match My Playbooks"}
            </button>
          </div>
        </section>

        {error && <p className={styles.error}>{error}</p>}

        {searched && (
          <section className={styles.results}>
            <div className={styles.resultsHeader}>
              <h2>Matching Playbooks</h2>
            </div>

            <p className={styles.resultsNote}>
              Similarity scores reflect how closely each playbook matches your search, not the probability of success.
            </p>

            {results.length === 0 && (
              <p>No matching playbooks found.</p>
            )}

            <div className={styles.grid}>
              {results.map((result, index) => (
                <Link
                  key={result.slug}
                  href={`/playbooks/${result.slug}`}
                  className={styles.card}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.rank}>
                      {index + 1}
                    </span>
                    <span className={styles.score}>
                      {Math.round(result.score * 100)}% similarity
                    </span>
                  </div>

                  <h3>{result.title}</h3>

                  <div className={styles.cardFooter}>
                    <span className={styles.viewLink}>
                      View playbook →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
