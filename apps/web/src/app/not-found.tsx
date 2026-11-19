import Link from "next/link";
import { COMMON_COPY } from "@/lib/ui-copy/common";

/**
 * Root 404 Page Component for FinAI Web.
 */
export default function NotFound() {
  return (
    <main className="fn-not-found-main">
      <h1 className="fn-not-found-title">{COMMON_COPY.NOT_FOUND.TITLE}</h1>
      <p className="fn-not-found-desc">{COMMON_COPY.NOT_FOUND.DESC}</p>
      <Link href="/" className="fn-not-found-btn">
        {COMMON_COPY.NOT_FOUND.RETURN_HOME}
      </Link>
    </main>
  );
}
