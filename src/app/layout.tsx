import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Networker Podcast | Telecommunications & Safety Insights',
  description: 'Your go-to podcast for telecommunications, workplace safety, health & safety regulations, and UK industry standards. Listen to expert insights and stay informed.',
  keywords: 'podcast, telecommunications, workplace safety, health and safety, UK regulations, industry standards',
  authors: [{ name: 'Networker Podcast' }],
  openGraph: {
    title: 'Networker Podcast',
    description: 'Expert insights on telecommunications and workplace safety',
    type: 'website',
    locale: 'en_GB',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
