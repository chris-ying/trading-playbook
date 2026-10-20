import Link from "next/link";
import { getPlaybooks } from "@/lib/playbooks";
import styles from "./page.module.css";

function getExcerpt(content: string): string {
  return content
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/^#{1,6}\s+.*$/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\[[ xX]\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

export default async function PlaybooksPage() {
  const playbooks = await getPlaybooks();

  return (
    <main className={styles.page}>
      <div className={styles.container}>

        <div className={styles.sectionHeader}>
          <h2>All playbooks</h2>

          <div className={styles.headerRight}>
            <span>{playbooks.length} playbooks</span>
            <Link href="/import" className={styles.importButton}>
              Import Playbooks
            </Link>
          </div>
        </div>

        <div className={styles.grid}>
          {playbooks.map((playbook) => (
            <Link
              key={playbook.slug}
              href={`/playbooks/${playbook.slug}`}
              className={styles.card}
            >
              <div className={styles.thumbnail}>
                {playbook.thumbnail ? (
                  <img
                    src={playbook.thumbnail}
                    alt={`${playbook.title} chart`}
                  />
                ) : (
                  <span>No chart available</span>
                )}
              </div>

              <div className={styles.cardBody}>
                <span className={styles.metadata}>
                  PLAYBOOK
                </span>

                <h3>{playbook.title}</h3>

                <p className={styles.excerpt}>
                  {getExcerpt(playbook.content).replace(/\+\+|\*+/g, "")}
                </p>

                <span className={styles.readLink}>
                  Read Playbook →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
