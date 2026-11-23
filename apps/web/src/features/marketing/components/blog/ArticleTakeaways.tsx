import React from "react";
import { UI_COPY } from "@/lib/ui-copy";

export interface ArticleTakeawaysProps {
  takeaways: readonly string[];
}

export function ArticleTakeaways({ takeaways }: ArticleTakeawaysProps): React.JSX.Element {
  const title = UI_COPY.MARKETING.BLOG.TAKEAWAYS_TITLE;

  return (
    <div className="fn-mkt-article-takeaways">
      <div className="fn-mkt-article-takeaways-title">{title}</div>
      <ul className="fn-mkt-article-takeaways-list">
        {takeaways.map((takeaway) => (
          <li key={takeaway}>{takeaway}</li>
        ))}
      </ul>
    </div>
  );
}
