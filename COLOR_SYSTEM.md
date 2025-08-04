# IXS Design System Colors

This document outlines the color system extracted from the Figma design and implemented in Tailwind CSS.

## 🎨 Color Palette

### Dark Theme Colors

#### Background Colors
```css
/* Main backgrounds from Figma */
--color-dark-100: #141419;  /* Sidebar background */
--color-dark-200: #16171C;  /* Main content background */
--color-dark-300: #222328;  /* Borders, cards, secondary elements */
```

#### Text Colors
```css
/* Text variations for dark backgrounds */
--color-light-100: #FFFFFF;                    /* Primary white text */
--color-light-200: rgba(255, 255, 255, 0.9);   /* High opacity white */
--color-light-300: rgba(255, 255, 255, 0.6);   /* Medium opacity white */
--color-light-400: rgba(255, 255, 255, 0.3);   /* Low opacity white */
```

#### Accent Colors
```css
/* Interactive elements */
--color-primary: #6C5CE7;        /* Primary brand color */
--color-primary-dark: #5A4FCF;   /* Primary hover state */
--color-white: #FFFFFF;          /* Pure white for buttons/cards */
```

## 🚀 Tailwind Classes

### Background Classes
```tsx
// Dark backgrounds
<div className="bg-dark-100">Sidebar</div>
<div className="bg-dark-200">Main content</div>
<div className="bg-dark-300">Cards/borders</div>

// Light backgrounds
<div className="bg-white">Buttons</div>
<div className="bg-light-200">Hover states</div>
```

### Text Classes
```tsx
// Text colors
<h1 className="text-white">Primary text</h1>
<p className="text-light-300">Secondary text</p>
<span className="text-light-400">Muted text</span>
<p className="text-dark-200">Dark text on light bg</p>
```

### Component Classes
```tsx
// Pre-built component classes
<button className="btn-connect-wallet">Connect Wallet</button>
<nav className="btn-nav-item">Navigation Item</nav>
<div className="sidebar">Sidebar Layout</div>
<main className="main-content">Main Content</main>
<div className="card-dark">Dark themed card</div>
```

## 📐 Border Radius

```css
/* Design system border radius */
rounded-32    /* 32px - Main containers */
rounded-50    /* 50px - Buttons */
rounded-100   /* 100px - Navigation pills */
```

## 🎯 Usage Examples

### Connect Wallet Button
```tsx
<button className="px-8 py-3 bg-white text-dark-200 rounded-50 font-medium hover:bg-light-200 transition-colors">
  Connect Wallet
</button>
```

### Navigation Item
```tsx
<a className="flex items-center gap-2.5 px-4 py-3 rounded-100 text-white text-lg font-medium opacity-50 hover:opacity-100">
  <Icon /> Navigation
</a>
```

### Sidebar Layout
```tsx
<aside className="bg-dark-100 w-60 h-screen flex flex-col justify-between p-8 rounded-tl-32 rounded-bl-32 border-r border-dark-300">
  {/* Sidebar content */}
</aside>
```

### Main Content
```tsx
<main className="bg-dark-200 flex-1 min-h-screen p-12 rounded-tr-32 rounded-br-32">
  {/* Main content */}
</main>
```

### Typography
```tsx
// Hero heading
<h1 className="text-5xl font-bold text-white leading-tight tracking-tight">
  Hero Title
</h1>

// Large heading
<h2 className="text-3xl font-bold text-white">
  Section Title
</h2>

// Muted text
<p className="text-light-300">Secondary information</p>
<p className="text-light-400">Tertiary information</p>
```

## 🔄 Theme Integration

The color system integrates with your existing styled-components theme:

```tsx
// In your theme provider
useEffect(() => {
  const root = document.documentElement

  // Set design system colors
  root.style.setProperty('--color-dark-100', '#141419')
  root.style.setProperty('--color-dark-200', '#16171C')
  root.style.setProperty('--color-dark-300', '#222328')
  root.style.setProperty('--color-light-300', 'rgba(255, 255, 255, 0.6)')
  root.style.setProperty('--color-light-400', 'rgba(255, 255, 255, 0.3)')
}, [])
```

## 📱 Responsive Design

The design system includes responsive utilities:

```tsx
// Responsive layouts
<div className="w-full md:w-60 lg:w-80">Responsive width</div>
<div className="p-4 md:p-8 lg:p-12">Responsive padding</div>

// Responsive text
<h1 className="text-2xl md:text-4xl lg:text-5xl">Responsive heading</h1>
```

## 🎨 Color Usage Guidelines

### Do's ✅
- Use `bg-dark-100` for sidebar backgrounds
- Use `bg-dark-200` for main content backgrounds
- Use `bg-dark-300` for cards and borders
- Use `text-white` for primary text on dark backgrounds
- Use `text-light-300` for secondary text
- Use `text-light-400` for muted text

### Don'ts ❌
- Don't mix light and dark background colors inappropriately
- Don't use low opacity text on low contrast backgrounds
- Don't override the design system colors without purpose

## 🔧 Customization

To customize colors, update the CSS custom properties:

```css
:root[data-theme="custom"] {
  --color-dark-100: #your-color;
  --color-dark-200: #your-color;
  --color-primary: #your-brand-color;
}
```

## 📊 Accessibility

The color system maintains accessibility standards:

- Contrast ratio of 4.5:1 for normal text
- Contrast ratio of 3:1 for large text
- Focus states clearly visible
- Interactive elements have hover/focus states

## 🧪 Testing

Test your components with the design system:

```tsx
import { IXSWelcomePage } from './components/IXSWelcomePage'

// Use the example component to verify colors are working
<IXSWelcomePage />
```
