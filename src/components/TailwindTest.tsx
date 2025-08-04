import React from 'react'
import { Button } from './components/ui/Button'
import { Card } from './components/ui/Card'

/**
 * Simple test component to verify Tailwind CSS is working
 * Add this to your app temporarily to test the setup
 */
export const TailwindTest: React.FC = () => {
  return (
    <div className="p-8 bg-bg-1 min-h-screen">
      <div className="max-w-md mx-auto space-y-4">
        <Card>
          <h2 className="text-xl font-bold text-text-1 mb-4">
            Tailwind Test
          </h2>
          <p className="text-text-2 mb-4">
            If you can see this styled correctly, Tailwind CSS is working!
          </p>
          <Button variant="primary" className="w-full">
            Test Button
          </Button>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="secondary" size="sm">
            Secondary
          </Button>
          <Button variant="outline" size="sm">
            Outline
          </Button>
        </div>
      </div>
    </div>
  )
}
