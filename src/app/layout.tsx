import type { Metadata } from 'next'
import { Parkinsans, Inter, JetBrains_Mono } from 'next/font/google'

import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

const parkinsans = Parkinsans({
  subsets: ['latin'],
  variable: '--font-parkinsans',
  weight: ['400', '600', '700'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Reflect - A Space for Your Thoughts',
  description:
    'A simple, private journaling app where your thoughts stay yours. No accounts, no storage, just you and your reflections.',
  keywords: [
    'journal',
    'journaling',
    'reflection',
    'thoughts',
    'private',
    'notes',
    'writing',
  ],
  authors: [{ name: 'Reflect App' }],
  creator: 'Reflect App',
  publisher: 'Reflect App',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://reflect-app.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Reflect - A Space for Your Thoughts',
    description:
      'A simple, private journaling app where your thoughts stay yours. No accounts, no storage, just you and your reflections.',
    url: 'https://reflect-app.vercel.app',
    siteName: 'Reflect',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Reflect - A Space for Your Thoughts',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reflect - A Space for Your Thoughts',
    description:
      'A simple, private journaling app where your thoughts stay yours. No accounts, no storage, just you and your reflections.',
    images: ['/og-image.png'],
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetBrainsMono.variable} ${parkinsans.variable} font-sans antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
