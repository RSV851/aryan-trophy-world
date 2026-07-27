import { MetadataRoute } from 'next';
import { db } from '@/db';
import { products, categories } from '@/db/schema';
import { eq, isNull, and } from 'drizzle-orm';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aryantrophyworld.com';
  const lastModified = new Date();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/inquiry`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
  ];

  try {
    // Dynamic Product detail URLs
    const activeProducts = await db
      .select({ slug: products.slug, id: products.id, updatedAt: products.updatedAt })
      .from(products)
      .where(and(isNull(products.deletedAt), eq(products.isActive, true)));

    const productUrls: MetadataRoute.Sitemap = activeProducts.map((p) => ({
      url: `${baseUrl}/products/${p.slug || p.id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // Dynamic Category URLs
    const activeCategories = await db
      .select({ slug: categories.slug })
      .from(categories);

    const categoryUrls: MetadataRoute.Sitemap = activeCategories.map((c) => ({
      url: `${baseUrl}/catalog?categorySlug=${c.slug}`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.85,
    }));

    return [...staticRoutes, ...categoryUrls, ...productUrls];
  } catch (error) {
    console.error('Failed to build dynamic sitemap:', error);
    return staticRoutes;
  }
}
