import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getPlaybook } from "@/lib/playbooks";
import styles from "./page.module.css";
import DeleteButton from "./DeleteButton";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function PlaybookPage({ params }: Props) {
  const { slug } = await params;
  const playbook = await getPlaybook(slug);

  if (!playbook) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <article className={styles.container}>

        <header className={styles.header}>
          <span className={styles.label}>TRADING PLAYBOOK</span>
          <h1 className={styles.title}>{playbook.title}</h1>
        </header>

        <div className={styles.content}>
          <ReactMarkdown>
            {playbook.content.replace(/^#\s+.+(?:\r?\n|$)/, "")}
          </ReactMarkdown>
        </div>
        
        <div className={styles.actions}>
          <DeleteButton slug={playbook.slug} />
        </div>
      </article>
    </main>
  );
}
