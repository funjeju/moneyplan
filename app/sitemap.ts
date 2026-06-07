import type { MetadataRoute } from 'next'
import { DEMO_ITEMS } from '@/lib/demo-data'
import { CATEGORY_META } from '@/lib/utils/category'

const BASE = 'https://lifecapsule.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const demoItemUrls = DEMO_ITEMS.map(item => ({
    url: `${BASE}/demo/items/${item.id}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  const demoCategoryUrls = Object.keys(CATEGORY_META).map(slug => ({
    url: `${BASE}/demo/categories/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [
    { url: BASE,                             lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/demo`,                   lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/demo/items`,             lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/demo/stats`,             lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/demo/expiry`,            lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/demo/notifications`,     lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/demo/cards`,             lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/demo/chat`,              lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/login`,                  lastModified: now, changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${BASE}/signup`,                 lastModified: now, changeFrequency: 'yearly',  priority: 0.5 },
    ...demoItemUrls,
    ...demoCategoryUrls,
  ]
}
