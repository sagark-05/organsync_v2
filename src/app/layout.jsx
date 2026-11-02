import "./globals.css";

export const metadata = {
  title: "OrganSync V2",
  description: "Organ Donation and Transplant Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
