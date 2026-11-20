"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { databaseModules, workspaceModules } from "./workspace-modules";

const overview = { href: "/", label: "Overview", icon: "grid" };

export default function ModuleNavigation() {
  const pathname = usePathname();

  function renderItem({ href, label, icon }) {
    return (
      <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>
        <span className={`icon icon-${icon}`} aria-hidden="true" />
        {label}
      </Link>
    );
  }

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark icon icon-cross" aria-hidden="true" />
          OrganSync <small>V2</small>
        </Link>
        <nav className="module-nav" aria-label="Workspace navigation">
          <div className="nav-group">
            <p>Workspace</p>
            {renderItem(overview)}
            {workspaceModules.map(renderItem)}
          </div>
          <div className="nav-group">
            <p>Database tools</p>
            {databaseModules.map(renderItem)}
          </div>
        </nav>
        <p className="sidebar-note">Educational workspace</p>
      </aside>
    </>
  );
}
