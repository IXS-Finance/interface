import React from 'react'
import { IXSWelcomePage } from './IXSWelcomePage'

/**
 * Design System Showcase Component
 * Tests all the new Figma-based colors and components
 */
export const DesignSystemShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-200 p-8">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center">
          <h1 className="heading-hero mb-4">IXS Design System</h1>
          <p className="text-muted text-lg">
            Colors and components from Figma design
          </p>
        </div>

        {/* Color Palette */}
        <section className="card-dark">
          <h2 className="heading-large mb-8">Color Palette</h2>

          {/* Dark Colors */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Dark Backgrounds</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-dark-100 p-6 rounded-lg border border-dark-300">
                <div className="text-white font-mono text-sm">dark-100</div>
                <div className="text-light-400 text-xs">#141419</div>
                <div className="text-light-300 text-sm mt-2">Sidebar</div>
              </div>
              <div className="bg-dark-200 p-6 rounded-lg border border-dark-300">
                <div className="text-white font-mono text-sm">dark-200</div>
                <div className="text-light-400 text-xs">#16171C</div>
                <div className="text-light-300 text-sm mt-2">Main content</div>
              </div>
              <div className="bg-dark-300 p-6 rounded-lg border border-dark-300">
                <div className="text-white font-mono text-sm">dark-300</div>
                <div className="text-light-400 text-xs">#222328</div>
                <div className="text-light-300 text-sm mt-2">Borders</div>
              </div>
            </div>
          </div>

          {/* Light Colors */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Light Text</h3>
            <div className="bg-dark-100 p-6 rounded-lg space-y-2">
              <div className="text-light-100">light-100 - Primary white text</div>
              <div className="text-light-200">light-200 - High opacity white (90%)</div>
              <div className="text-light-300">light-300 - Medium opacity white (60%)</div>
              <div className="text-light-400">light-400 - Low opacity white (30%)</div>
            </div>
          </div>
        </section>

        {/* Button Showcase */}
        <section className="card-dark">
          <h2 className="heading-large mb-8">Button Components</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-white font-semibold mb-4">Connect Wallet</h3>
              <button className="btn-connect-wallet w-full">
                Connect Wallet
              </button>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Navigation Item</h3>
              <div className="btn-nav-item">
                <span>🚀</span>
                <span>Launchpad</span>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Active Navigation</h3>
              <div className="btn-nav-item active">
                <span>💰</span>
                <span>Earn</span>
              </div>
            </div>
          </div>
        </section>

        {/* Typography Showcase */}
        <section className="card-dark">
          <h2 className="heading-large mb-8">Typography</h2>

          <div className="space-y-6">
            <div>
              <h1 className="heading-hero">Hero Heading</h1>
              <p className="text-light-400 text-sm mt-2">48px, Bold, Tight tracking</p>
            </div>

            <div>
              <h2 className="heading-large">Large Heading</h2>
              <p className="text-light-400 text-sm mt-2">36px, Bold</p>
            </div>

            <div>
              <p className="text-white text-lg">Primary Text (18px)</p>
              <p className="text-light-400 text-sm mt-2">Default text for main content</p>
            </div>

            <div>
              <p className="text-muted">Secondary Text</p>
              <p className="text-light-400 text-sm mt-2">60% opacity for secondary information</p>
            </div>

            <div>
              <p className="text-muted-light">Tertiary Text</p>
              <p className="text-light-400 text-sm mt-2">30% opacity for muted content</p>
            </div>
          </div>
        </section>

        {/* Layout Components */}
        <section className="card-dark">
          <h2 className="heading-large mb-8">Layout Components</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Mini Sidebar</h3>
              <div className="bg-dark-100 p-4 rounded-32 border border-dark-300 h-48">
                <div className="text-white text-xl font-bold mb-4">🔸 IXS</div>
                <div className="space-y-2">
                  <div className="btn-nav-item text-sm py-2">💰 Earn</div>
                  <div className="btn-nav-item text-sm py-2 active">🚀 Launch</div>
                  <div className="btn-nav-item text-sm py-2">💧 Pools</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Main Content Area</h3>
              <div className="bg-dark-200 p-6 rounded-32 border border-dark-300 h-48 flex items-center justify-center">
                <div className="text-center">
                  <h4 className="text-white text-lg font-semibold mb-2">Main Content</h4>
                  <p className="text-muted">This is where your main content goes</p>
                  <button className="btn-connect-wallet mt-4">Action Button</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Border Radius Showcase */}
        <section className="card-dark">
          <h2 className="heading-large mb-8">Border Radius System</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-dark-200 p-6 rounded-32 border border-dark-300">
              <div className="text-white font-mono text-sm">rounded-32</div>
              <div className="text-light-400 text-xs">32px - Containers</div>
            </div>

            <div className="bg-white text-dark-200 p-4 rounded-50 text-center">
              <div className="font-mono text-sm">rounded-50</div>
              <div className="text-xs opacity-60">50px - Buttons</div>
            </div>

            <div className="bg-white bg-opacity-10 p-4 rounded-100 text-center">
              <div className="text-white font-mono text-sm">rounded-100</div>
              <div className="text-light-400 text-xs">100px - Pills</div>
            </div>
          </div>
        </section>

        {/* Full Design Example */}
        <section>
          <h2 className="heading-large mb-8 text-center">Complete Design Example</h2>
          <div className="border border-dark-300 rounded-32 overflow-hidden">
            <IXSWelcomePage />
          </div>
        </section>

      </div>
    </div>
  )
}
