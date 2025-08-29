'use client'

import { Reflector } from '@/components/app/reflector'
import { usePageTracking } from '@/hooks/use-analytics'

const Page = () => {
  usePageTracking()

  return (
    <main className="bg-background min-h-screen">
      <Reflector />
    </main>
  )
}

export default Page
