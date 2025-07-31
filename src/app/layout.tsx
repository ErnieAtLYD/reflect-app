import type { Metadata } from 'next'
import { Parkinsans } from 'next/font/google'

const parkinsans = Parkinsans({
  subsets: ['latin'],
  variable: '--font-parkinsans',
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
      <body className={parkinsans.variable}>{children}</body>
    </html>
  )
}
