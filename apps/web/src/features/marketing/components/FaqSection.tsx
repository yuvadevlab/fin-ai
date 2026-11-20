import React from "react";
import { UI_COPY } from "@/lib/ui-copy";
import { generateFaqSchema } from "@/lib/constants/seo.constants";

export function FaqSection(): React.JSX.Element {
  const copy = UI_COPY.MARKETING.FAQ;
  const faqSchema = generateFaqSchema(copy.ITEMS);

  return (
    <section className="fn-mkt-section fn-mkt-section-bordered" id="faq">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="fn-mkt-container">
        <div className="fn-mkt-section-header">
          <div className="fn-mkt-badge">{copy.BADGE}</div>
          <h2 className="fn-mkt-section-title">{copy.TITLE}</h2>
        </div>

        <div className="fn-mkt-faq-list">
          {copy.ITEMS.map((item) => (
            <div key={item.question} className="fn-mkt-faq-item">
              <h3 className="fn-mkt-faq-q">{item.question}</h3>
              <p className="fn-mkt-faq-a">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
