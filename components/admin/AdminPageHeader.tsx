import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export function AdminPageHeader({ eyebrow, title, subtitle, icon, actions }: AdminPageHeaderProps) {
  return (
    <div className="admin-page-header">
      <div>
        <p className="admin-eyebrow">{eyebrow}</p>
        <h1 className="admin-heading flex items-center gap-3">
          {icon}
          {title}
        </h1>
        {subtitle ? <p className="admin-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
