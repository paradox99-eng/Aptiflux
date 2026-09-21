export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aptiflux.vercel.app';

  const routes = [
    '',
    '/about',
    '/contact',
    '/practice',
    '/weekly-quiz',
    '/leaderboard',
    '/login',
    '/signup',
    '/terms',
    '/privacy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  return [...routes];
}
