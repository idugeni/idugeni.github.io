import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getTrashShortlinks } from "@/actions/shortlinks";
import { TrashListClient } from "./TrashListClient";

export default async function AdminShortlinksTrash() {
  const shortlinks = await getTrashShortlinks();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="SHORTLINK_TRASH_BIN"
        title="Trash"
        subtitle="Soft-deleted shortlinks. Restore or permanently delete items."
      />
      <TrashListClient shortlinks={shortlinks} />
    </div>
  );
}
