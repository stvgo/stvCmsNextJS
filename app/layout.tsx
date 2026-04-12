import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { ReactQueryProvider } from '@/components/providers/react-query-provider';
import { validateEnv } from '@/lib/env';

// Validate environment variables at startup
validateEnv();

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const metadata = {
  title: {
    default: 'STV CMS - Content Management System',
    template: '%s | STV CMS',
  },
  description: 'A modern Next.js CMS with real-time content management',
  keywords: ['CMS', 'Content Management', 'Next.js', 'Blog'],
  authors: [{ name: 'Stiven Valeriano' }],
  creator: 'Stiven Valeriano',
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'STV CMS - Content Management System',
    description: 'A modern Next.js CMS with real-time content management',
    siteName: 'STV CMS',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            themes={["dark", "bw"]}
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
