import { uploadPlaybooks } from "./actions";
import styles from "./page.module.css";

type Props = {
  searchParams: Promise<{
    imported?: string;
    images?: string;
  }>;
};

export default async function ImportPage({
  searchParams,
}: Props) {
  const result = await searchParams;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1>Import Playbooks</h1>

        <p className={styles.description}>
          Import Markdown notes and TradingView screenshots
          automatically from your exported ZIP file.
        </p>

        <form action={uploadPlaybooks} className={styles.form}>
          <label htmlFor="archive">
            Select your playbook ZIP file
          </label>

          <input
            type="file"
            name="file"
            accept=".zip"
            required
            className={styles.fileInput}
          />

          <button type="submit" className={styles.importButton}>
            Import Playbooks
          </button>
        </form>

        {result.imported !== undefined && (
          <div className={styles.result}>
            <h2>Import complete</h2>
            <p>Imported: {result.imported} playbooks</p>
            <p>Images saved: {result.images}</p>
          </div>
        )}

        <a href="/playbooks" className={styles.back}>
          ← View Playbooks
        </a>
      </div>
    </main>
  );
}