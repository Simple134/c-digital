import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://www.estudiocdigital.com',
            lastModified: new Date('2026-02-21'),
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: 'https://www.estudiocdigital.com/servicios',
            lastModified: new Date('2026-02-21'),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: 'https://www.estudiocdigital.com/nosotros',
            lastModified: new Date('2026-02-21'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: 'https://www.estudiocdigital.com/blog',
            lastModified: new Date('2026-02-21'),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: 'https://www.estudiocdigital.com/blog/guia-definitiva-contratar-agencia-marketing-digital-2026',
            lastModified: new Date('2026-02-21'),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: 'https://www.estudiocdigital.com/recursos',
            lastModified: new Date('2026-02-21'),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: 'https://www.estudiocdigital.com/contacto',
            lastModified: new Date('2026-02-21'),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
    ]
}
