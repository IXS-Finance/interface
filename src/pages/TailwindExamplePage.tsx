import React from 'react'
import { Button } from '../components/ui/Button'
import { Card, Input } from '../components/ui/Card'
import { TailwindThemeProvider } from '../hooks/useTailwindTheme'

/**
 * Example page demonstrating the hybrid approach:
 * - Uses Tailwind CSS for new components (Button, Card, Input)
 * - Maintains existing styled-components for complex logic
 * - Shows how both can work together seamlessly
 */
export const TailwindExamplePage: React.FC = () => {
  return (
    <TailwindThemeProvider>
      <div className="min-h-screen bg-bg-1 py-8">
        <div className="container-responsive px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-text-1 mb-4">
              Hybrid <span className="text-gradient">Tailwind</span> Demo
            </h1>
            <p className="text-lg text-text-2 max-w-2xl mx-auto">
              This page demonstrates how Tailwind CSS can work alongside your existing styled-components system.
            </p>
          </div>

          {/* Example Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card>
              <h3 className="text-xl font-semibold text-text-1 mb-3">Primary Actions</h3>
              <div className="space-y-3">
                <Button variant="primary" className="w-full">
                  Primary Button
                </Button>
                <Button variant="secondary" className="w-full">
                  Secondary Button
                </Button>
                <Button variant="outline" className="w-full">
                  Outline Button
                </Button>
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold text-text-1 mb-3">Form Elements</h3>
              <div className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                />
                <Button variant="primary" className="w-full">
                  Submit
                </Button>
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-semibold text-text-1 mb-3">Responsive Layout</h3>
              <p className="text-text-2 mb-4">
                This layout automatically adapts to different screen sizes using Tailwind&apos;s responsive utilities.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="ghost">Small</Button>
                <Button size="sm" variant="ghost">Buttons</Button>
              </div>
            </Card>
          </div>

          {/* Feature Showcase */}
          <Card className="mb-8">
            <div className="flex-between mb-6">
              <h2 className="text-2xl font-bold text-text-1">Hybrid Approach Benefits</h2>
              <Button variant="outline" size="sm">
                Learn More
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-text-1 mb-3">🎨 Theme Integration</h4>
                <p className="text-text-2 mb-4">
                  Tailwind CSS variables are automatically synced with your styled-components theme,
                  ensuring consistent colors across both systems.
                </p>
                <ul className="space-y-2 text-sm text-text-2">
                  <li>• Dynamic theme switching</li>
                  <li>• Whitelabel color support</li>
                  <li>• CSS custom properties</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-text-1 mb-3">⚡ Development Speed</h4>
                <p className="text-text-2 mb-4">
                  Use Tailwind for rapid prototyping and simple components, while keeping
                  styled-components for complex dynamic styling.
                </p>
                <ul className="space-y-2 text-sm text-text-2">
                  <li>• Utility-first approach</li>
                  <li>• Component composition</li>
                  <li>• Responsive design</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Code Example */}
          <Card padding="lg" className="bg-bg-2">
            <h3 className="text-xl font-semibold text-text-1 mb-4">Usage Example</h3>
            <div className="bg-bg-0 rounded-lg p-4 font-mono text-sm">
              <div className="text-text-2 mb-2">{`// Using the new Tailwind components:`}</div>
              <div className="text-text-1">
                {`<Button variant="primary" size="lg" className="w-full">`}<br/>
                {`  Submit Form`}<br/>
                {`</Button>`}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </TailwindThemeProvider>
  )
}
