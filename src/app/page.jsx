import Link from "next/link";
import { workspaceModules } from "@/components/layout/workspace-modules";

const journey = [
  { title: "Register donors and patients", icon: "person" },
  { title: "Review candidate matches", icon: "link" },
  { title: "Record transplants and follow-ups", icon: "cross" },
];

export default function Home() {
  return (
    <main id="main-content" className="shell overview" tabIndex={-1}>
      <header className="overview-header">
        <p>Transplant workspace</p>
        <span>Demo environment</span>
      </header>

      <section className="hero" aria-labelledby="overview-title">
        <div className="hero-copy">
          <h1 id="overview-title">Organ donation &amp;<br className="hero-break" /> transplant care</h1>
          <p>Explore the journey from donor registration through matching, transplantation, and follow-up using fictional records.</p>
          <a className="button hero-button" href="#workspace">Explore workspace</a>
        </div>
        <div className="journey">
          <h2>Donation workflow</h2>
          <ol>
            {journey.map(({ title, icon }) => (
              <li key={title}>
                <span className={`journey-icon icon icon-${icon}`} aria-hidden="true" />
                {title}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="workspace" aria-labelledby="workspace-heading">
        <div className="section-heading">
          <h2 id="workspace-heading">Workspace modules</h2>
        </div>
        <div className="module-grid">
          {workspaceModules.map(({ href, label, icon, description }) => (
            <Link className="module-card" key={href} href={href}>
              <span className={`module-icon icon icon-${icon}`} aria-hidden="true" />
              <div>
                <h3>{label}</h3>
                <p>{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="connection" aria-labelledby="connection-heading">
        <div>
          <h2 id="connection-heading">MySQL connectivity</h2>
          <p>Check the live database connection and record counts.</p>
        </div>
        <a className="button secondary" href="/api/health">Check connection</a>
      </section>
    </main>
  );
}
