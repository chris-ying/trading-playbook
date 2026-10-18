"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className={styles.navbar}>
      <div className={styles.navInner}>
        <Link href="/" className={styles.brand}>
          <img
            src="/trading-playbook-logo.svg"
            alt=""
            className={styles.brandLogo}
          />
          <span>
            TRADING
            <span className={styles.brandMuted}>PLAYBOOK</span>
          </span>
        </Link>

        <nav className={styles.navLinks}>
          <Link
            href="/"
            className={pathname === "/" ? styles.activeLink : ""}
          >
            Playbook Matcher
          </Link>

          <Link
            href="/playbooks"
            className={
              pathname.startsWith("/playbooks")
                ? styles.activeLink
                : ""
            }
          >
            Playbooks
          </Link>
        </nav>

      </div>
    </header>
  );
}
