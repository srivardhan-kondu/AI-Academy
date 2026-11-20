import type { MetadataRoute } from "next";
import { listSchools, listPaths, listPublishedLessons, listLabs, listProjects } from "@/lib/content/queries";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [schools, paths, lessons, labs, projects] = await Promise.all([listSchools(), listPaths(), listPublishedLessons(), listLabs(), listProjects()]);
  const base = siteUrl();
  const staticPages = ["", "/about", "/contact", "/pricing", "/get-started", "/academy", "/academy/schools", "/academy/paths", "/labs", "/projects"];
  return [
    ...staticPages.map((p) => ({ url: `${base}${p}` })),
    ...schools.map((s) => ({ url: `${base}/academy/schools/${s.slug}`, lastModified: s.updatedAt })),
    ...paths.map((p) => ({ url: `${base}/academy/paths/${p.slug}`, lastModified: p.updatedAt })),
    ...lessons.map((l) => ({ url: `${base}/academy/lessons/${l.slug}`, lastModified: l.updatedAt })),
    ...labs.map((l) => ({ url: `${base}/labs/${l.slug}` })),
    ...projects.map((p) => ({ url: `${base}/projects/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
