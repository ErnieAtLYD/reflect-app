'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function Counter() {
  const [count, setCount] = useState(0)

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Counter</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="text-4xl font-bold" data-testid="count">
          {count}
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setCount(count - 1)}
            variant="outline"
            data-testid="decrement"
          >
            -
          </Button>
          <Button
            onClick={() => setCount(0)}
            variant="secondary"
            data-testid="reset"
          >
            Reset
          </Button>
          <Button onClick={() => setCount(count + 1)} data-testid="increment">
            +
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
