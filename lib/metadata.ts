import { Metadata } from 'next'

interface MetadataConfig {
  title: string
  description: string
  image?: string
  url?: string
}

export function generateMetadata({
  title,
  description,
  image = '/images/hero-six-sigma.png',
  url = 'https://lean-projax-saas-production.up.railway.app',
}: MetadataConfig): Metadata {
  const fullTitle = `${title} | Lean Projax`
  const imageUrl = `${url}${image}`

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: 'Lean Projax',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: 'Lean Projax - Six Sigma Workflow Automation',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: '@leanprojax',
    },
    metadataBase: new URL(url),
  }
}

// Default metadata for the site
export const defaultMetadata = generateMetadata({
  title: 'Six Sigma Workflow Automation Platform',
  description:
    'Create professional Six Sigma reports in minutes. The only platform built specifically for Business Process Improvement teams. Reduce report creation time by 60-70%.',
})
