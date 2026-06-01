import { notFound } from "next/navigation";
import { getShortlinkById } from "@/actions/shortlinks";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ShortlinkForm } from "../../ShortlinkForm";

export default async function EditShortlink({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shortlink = await getShortlinkById(id);

  if (!shortlink) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="EDIT_SHORTLINK"
        title={`Edit: ${shortlink.code}`}
        subtitle="Update shortlink configuration and display mode settings."
      />

      <ShortlinkForm mode="edit" shortlink={shortlink} />
    </div>
  );
}
