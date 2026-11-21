import React from "react";
import { Badge } from "@fin-ai/ui";
import { UI_COPY } from "@/lib/ui-copy";
import { generateFaqSchema } from "@/lib/constants/seo.constants";

export function FaqSection(): React.JSX.Element {
  const copy = UI_COPY.MARKETING.FAQ;
  const faqSchema = generateFaqSchema(copy.ITEMS);

  return (
    <section
      className="fn-mkt-section fn-mkt-section-bordered"
      id="faq"
      aria-labelledby="faq-heading"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="fn-mkt-container">
        <div className="fn-mkt-section-header">
          <Badge className="fn-mkt-badge">{copy.BADGE}</Badge>
          <h2 id="faq-heading" className="fn-mkt-section-title">
            {copy.TITLE}
          </h2>
        </div>

        <dl className="fn-mkt-faq-list">
          {copy.ITEMS.map((item) => (
            <div key={item.question} className="fn-mkt-faq-item">
              <dt className="fn-mkt-faq-q">
                <h3>{item.question}</h3>
              </dt>
              <dd className="fn-mkt-faq-a">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
