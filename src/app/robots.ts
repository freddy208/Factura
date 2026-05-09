import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/dashboard/', '/devis/', '/factures/', '/clients/', '/notifications/', '/profil/', '/settings/', '/upgrade/', '/onboarding/'],
    },
    sitemap: 'https://factura.app/sitemap.xml',
  }
}