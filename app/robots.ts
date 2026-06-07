import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/demo', '/demo/'],
        disallow: ['/api/', '/settings', '/notifications'],
      },
    ],
    sitemap: 'https://lifecapsule.app/sitemap.xml',
  }
}
