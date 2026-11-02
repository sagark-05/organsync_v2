import Link from "next/link";
const modules = [["donors", "Donors"], ["patients", "Patients"], ["organs", "Organs"], ["waiting-list", "Waiting list"], ["matching", "Matching"], ["transplants", "Transplants"], ["database-demo", "Database demo"], ["database-sync", "Database sync"]];
export default function ModuleNavigation({ current }) {
  return <nav aria-label="Management">{modules.map(([path, label]) => <Link key={path} href={`/${path}`} aria-current={current === path ? "page" : undefined}>{label}</Link>)}</nav>;
}

