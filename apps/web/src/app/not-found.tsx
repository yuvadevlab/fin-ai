import Link from "next/link";

/**
 * Root 404 Page Component for FinAI Web.
 */
export default function NotFound() {
  return (
    <main
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "1rem",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>404 - Page Not Found</h1>
      <p style={{ color: "var(--muted-foreground, #6b7280)" }}>
        The requested financial resource or page could not be found.
      </p>
      <Link
        href="/"
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "0.375rem",
          backgroundColor: "var(--primary, #0f172a)",
          color: "var(--primary-foreground, #ffffff)",
          textDecoration: "none",
          fontWeight: 500,
        }}
      >
        Return to Dashboard
      </Link>
    </main>
  );
}
