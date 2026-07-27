import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aryantrophyworld.com';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/catalog', '/products/*', '/about', '/contact', '/inquiry'],
      disallow: ['/admin/*', '/api/*'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
