import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";

/** Serves uploaded media stored in the database, with a safe content type. */
export async function GET(_req: Request, ctx: RouteContext<"/media/[id]">) {
  const { id } = await ctx.params;
  const [row] = await db.select().from(media).where(eq(media.storedName, id)).limit(1);
  if (!row) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(row.data), {
    headers: {
      "Content-Type": row.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": row.mimeType === "application/pdf" ? `attachment; filename="${row.fileName.replace(/[^\w.-]/g, "_")}"` : "inline",
    },
  });
}
