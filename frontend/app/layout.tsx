import type { Metadata } from 'next';
import { Fraunces, Sora } from 'next/font/google';
import { Providers } from './providers';
import { ToastProvider } from '@/components/Toast';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['300', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['300', '400', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TripMind — AI Travel Planner',
  description: 'Plan personalized trips with AI. No more tabs, no guesswork. TripMind builds your perfect itinerary in seconds.',
  openGraph: {
    title: 'TripMind — AI Travel Planner',
    description: 'Plan personalized trips with AI. No more tabs, no guesswork.',
    type: 'website',
    siteName: 'TripMind',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TripMind — AI Travel Planner',
    description: 'Plan personalized trips with AI. No more tabs, no guesswork.',
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✈</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${fraunces.variable} font-sora antialiased`}>
        <Providers>
          <ToastProvider>
            {children}
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
