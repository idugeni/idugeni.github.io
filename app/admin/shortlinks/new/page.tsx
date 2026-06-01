import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ShortlinkForm } from "../ShortlinkForm";

export default function NewShortlink() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="CREATE_SHORTLINK"
        title="New Shortlink"
        subtitle="Create a new short URL with QR code and custom display mode."
      />

      <ShortlinkForm mode="create" />
    </div>
  );
}
