import type { Metadata } from 'next'

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
      <body>{children}</body>
    </html>
  )
}
