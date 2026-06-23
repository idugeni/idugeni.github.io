interface SectionEmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
}

export function SectionEmptyState({ title, description, icon = "[NULL]" }: SectionEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 border border-primary/20 bg-primary/5 flex items-center justify-center mb-4">
        <span className="font-mono text-lg text-primary/40">{icon}</span>
      </div>
      <h3 className="font-orbitron text-sm font-bold text-muted-foreground mb-1">{title}</h3>
      {description && (
        <p className="font-mono text-xs text-muted-foreground/60 text-center max-w-sm">{description}</p>
      )}
    </div>
  );
}
