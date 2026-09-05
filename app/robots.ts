import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://vordia.ai/sitemap.xml',
    host: 'https://vordia.ai',
  };
}
