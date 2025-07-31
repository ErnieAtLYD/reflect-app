import type { Metadata } from 'next'
import { Parkinsans, Inter, JetBrains_Mono } from 'next/font/google'

const parkinsans = Parkinsans({
  subsets: ['latin'],
  variable: '--font-parkinsans',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Reflect App',
  description: 'A Next.js application with TypeScript and Tailwind CSS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetBrainsMono.variable} ${parkinsans.variable} font-body antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
