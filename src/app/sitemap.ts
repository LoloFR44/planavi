import type { MetadataRoute } from 'next';
import { getAllPlannings } from '@/services/plannings';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.planning-visites.fr';

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/cgu`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/mentions-legales`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    const plannings = await getAllPlannings();
    const planningPages: MetadataRoute.Sitemap = plannings
      .filter((p) => p.isActive)
      .map((p) => ({
        url: `${baseUrl}/planning/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }));

    return [...staticPages, ...planningPages];
  } catch {
    return staticPages;
  }
}
