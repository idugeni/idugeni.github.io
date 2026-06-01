"use client";

import { AnnouncementForm } from "../AnnouncementForm";

export default function NewAnnouncementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-orbitron text-2xl font-bold uppercase tracking-wider text-primary">
          CREATE_ANNOUNCEMENT
        </h1>
        <p className="text-sm text-muted-foreground font-mono">
          Broadcast a new message to specific paths or placement systems
        </p>
      </div>
      <AnnouncementForm mode="create" />
    </div>
  );
}
