import React from "react";
import { cn } from "../lib/utils";

interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions, className, ...props }: PageHeaderProps) {
  return (
    <div className={cn("finai-page-header", className)} {...props}>
      <div className="finai-page-header-title-wrap">
        <h1 className="finai-page-header-title">{title}</h1>
        {description && <p className="finai-page-header-desc">{description}</p>}
      </div>
      {actions && <div className="finai-page-header-actions">{actions}</div>}
    </div>
  );
}
