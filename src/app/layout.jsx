import { Inter, Fira_Code } from 'next/font/google';
import '../index.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AuthProvider } from '../context/AuthContext';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fira-code',
});

export const metadata = {
  title: {
    default: 'Aptiflux Platform | Master Your Aptitude',
    template: '%s | Aptiflux',
  },
  description: 'The ultimate online platform for mock aptitude tests, interview prep, and skill assessments. Track your progress and excel in your career.',
  keywords: ['aptitude', 'mock test', 'interview preparation', 'career', 'assessment', 'coding', 'reasoning'],
  authors: [{ name: 'Aptiflux Team' }],
  creator: 'Aptiflux',
  publisher: 'Aptiflux',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://aptiflux.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Aptiflux Platform | Master Your Aptitude',
    description: 'The ultimate online platform for mock aptitude tests, interview prep, and skill assessments.',
    url: '/',
    siteName: 'Aptiflux',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aptiflux Platform | Master Your Aptitude',
    description: 'The ultimate online platform for mock aptitude tests, interview prep, and skill assessments.',
    creator: '@aptiflux',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.png',
  },
  verification: {
    google: 'neYMVTRcywO6jF8C-2B0E3Fg3XZk_AB7PJ69',
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${firaCode.variable}`}>
      <body className="flex flex-col min-h-screen">
        <NextTopLoader
          color="#3b82f6"
          initialPosition={0.08}
          crawlSpeed={200}
          height={4}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #3b82f6,0 0 5px #3b82f6"
          zIndex={1600}
        />
        <AuthProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AuthProvider>
        <SpeedInsights />
        <Toaster richColors position="bottom-right" theme="system" />
      </body>
    </html>
  );
}

