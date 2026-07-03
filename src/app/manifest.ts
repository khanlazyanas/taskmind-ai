import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TaskMind AI Workspace',
    short_name: 'TaskMind',
    description: 'Intelligent workspace and automated workflow routing.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      // Agar future mein tum apna koi logo banao, toh usko public folder mein daal kar yahan add kar sakte ho
    ],
  };
}