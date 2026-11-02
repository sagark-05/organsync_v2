import Link from "next/link";

const modules = [
  ['Dashboard', 'A central view of donation and transplant activity.'],
  ['Donors', 'Coordinate donor registration and donation information.'],
  ['Patients', 'Organize patient profiles and care information.'],
  ['Organs', 'Track donated organs and their availability.'],
  ['Waiting List', 'Review waiting patients and allocation priorities.'],
  ['Matching', 'Support compatibility assessment and matching.'],
  ['Transplants', 'Follow transplant procedures and outcomes.'],
  ['Reports', 'Explore operational summaries and insights.'],
];

export default function Home() {
  return (
    <div className="shell">
      <header><a className="brand" href="/" aria-label="OrganSync V2 home"><span className="mark" aria-hidden="true">+</span>OrganSync <small>V2</small></a><nav><Link href="/database-demo">MySQL demonstrations ↗</Link><Link href="/database-sync">Atlas synchronization ↗</Link></nav></header>
      <main>
        <section className="hero">
          <div><p className="eyebrow">CONNECTED CARE. SHARED PURPOSE.</p><h1>Every donation.<br />A new possibility.</h1><p className="intro">Organ Donation and Transplant Management System</p><p className="description">A shared workspace for organizing donation information, coordinating care, and understanding the journey from donor to recipient.</p><a className="button" href="#workspace">Explore the modules →</a></div>
          <aside className="journey" aria-label="Donation journey overview"><p className="eyebrow">THE JOURNEY OF CARE</p>{[['Register', 'Bring donors and patients into focus.'], ['Connect', 'Understand availability and compatibility.'], ['Coordinate', 'Support the path toward transplantation.']].map(([title, text], i) => <div className="step" key={title}><span>0{i + 1}</span><div><h2>{title}</h2><p>{text}</p></div></div>)}<p className="note">An educational database management project</p></aside>
        </section>
        <section id="workspace" aria-labelledby="workspace-heading"><div className="section-heading"><div><p className="eyebrow">YOUR WORKSPACE</p><h2 id="workspace-heading">One system. Connected modules.</h2></div><p>Explore registries, waiting lists, and educational candidate matching.</p></div><div className="grid">{modules.map(([name, description], i) => <article key={name}><div className="card-top"><span>0{i + 1}</span><span className="badge">{["Donors", "Patients", "Organs", "Waiting List", "Matching", "Transplants"].includes(name) ? "Registry" : "Planned"}</span></div><h3>{["Donors", "Patients", "Organs", "Waiting List", "Matching", "Transplants"].includes(name) ? <Link href={`/${name.toLowerCase().replaceAll(" ", "-")}`}>{name} →</Link> : name}</h3><p>{description}</p></article>)}</div></section>
        <section className="connection" aria-label="Database connectivity"><div><h2>Check the connection</h2><p>The health endpoint checks MySQL and returns live donor, patient, and organ counts when configured.</p></div><a className="button secondary" href="/api/health">Check MySQL health ↗</a></section>
      </main>
      <footer><span>OrganSync V2</span><span>Organ donation &amp; transplant management · Educational project</span></footer>
    </div>
  );
}
