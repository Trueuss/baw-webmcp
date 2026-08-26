import type { MetadataRoute } from 'next';

const BASE = 'https://baw-webmcp.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`,        lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/stylelab`, lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/stylist`,  lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/tools`,    lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/lookbook`, lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/how`,      lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/privacy`,  lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/pricing`,  lastModified: now, changeFrequency: 'monthly', priority: 0.5 }
  ];
}
