import { notFound } from "next/navigation";
import { getAnnouncementById } from "@/actions/announcements";
import { AnnouncementForm } from "../../AnnouncementForm";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAnnouncementPage({ params }: EditPageProps) {
  const { id } = await params;
  const announcement = await getAnnouncementById(id);

  if (!announcement) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-orbitron text-2xl font-bold uppercase tracking-wider text-primary">
          EDIT_ANNOUNCEMENT
        </h1>
        <p className="text-sm text-muted-foreground font-mono">
          Modify configuration for notification ID: <span className="font-mono text-foreground font-semibold">{id}</span>
        </p>
      </div>
      <AnnouncementForm mode="edit" initialData={announcement} />
    </div>
  );
}
