import { VordiaLanding } from '@/components/vordia-landing';

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://vordia.ai/#organization',
      name: 'Vordia AI',
      url: 'https://vordia.ai/',
      logo: {
        '@type': 'ImageObject',
        url: 'https://vordia.ai/favicon.png',
        width: 512,
        height: 512,
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://vordia.ai/#website',
      url: 'https://vordia.ai/',
      name: 'Vordia AI',
      alternateName: 'Vordia',
      inLanguage: 'en-US',
      publisher: {
        '@id': 'https://vordia.ai/#organization',
      },
    },
    {
      '@type': 'Product',
      '@id': 'https://vordia.ai/#vordia-duo',
      name: 'Vordia Duo',
      model: 'Duo',
      url: 'https://vordia.ai/',
      description:
        'A detachable AI voice recorder and wearable that captures real-world conversations, creates transcripts and summaries, and turns meetings into searchable memory.',
      category: 'AI voice recorder and wearable',
      image: [
        'https://vordia.ai/assets/vordia-duo-wrist.png',
        'https://vordia.ai/assets/vordia-duo-clip.png',
        'https://vordia.ai/assets/vordia-duo-scroll-poster.png',
      ],
      brand: {
        '@type': 'Brand',
        name: 'Vordia AI',
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        id="vordia-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <VordiaLanding />
    </>
  );
}
