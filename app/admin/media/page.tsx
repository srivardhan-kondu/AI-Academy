import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { uploadMedia, deleteMedia } from "@/app/actions/admin";
import { AdminPage, Field } from "@/components/admin/fields";
import { ActionForm, SubmitButton } from "@/components/ui/form";
import { formatDate } from "@/lib/utils";

export default async function AdminMedia() {
  const rows = await db
    .select({ id: media.id, fileName: media.fileName, storedName: media.storedName, mimeType: media.mimeType, size: media.size, altText: media.altText, createdAt: media.createdAt })
    .from(media)
    .orderBy(desc(media.createdAt));
  return (
    <AdminPage title="Media library" description="Upload images (PNG, JPEG, WebP, GIF) and PDFs up to 5 MB. Files are type-checked by content and served from /media/….">
      <ActionForm action={uploadMedia} className="card space-y-3 p-5">
        <div>
          <label htmlFor="file" className="label">File</label>
          <input id="file" name="file" type="file" accept="image/png,image/jpeg,image/webp,image/gif,application/pdf" required className="block text-sm" />
        </div>
        <Field name="altText" label="Default alt text (images)" />
        <SubmitButton pendingText="Uploading…">Upload</SubmitButton>
      </ActionForm>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((m) => (
          <div key={m.id} className="card overflow-hidden">
            {m.mimeType.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/media/${m.storedName}`} alt={m.altText ?? m.fileName} className="h-36 w-full bg-slate-50 object-contain" />
            ) : (
              <div className="grid h-36 place-items-center bg-slate-50 text-sm text-slate-500">PDF</div>
            )}
            <div className="space-y-1 p-3 text-xs">
              <p className="truncate font-medium">{m.fileName}</p>
              <p className="text-slate-500">{(m.size / 1024).toFixed(0)} KB · {formatDate(m.createdAt)}</p>
              <code className="block truncate rounded bg-slate-100 p-1">/media/{m.storedName}</code>
              <form action={deleteMedia}>
                <input type="hidden" name="id" value={m.id} />
                <button className="btn-ghost btn-sm text-red-700" type="submit">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </AdminPage>
  );
}
