// Color utilities and constants for the application

export const COLORS = {
  // Brand colors
  brand: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#4f46e5',
    600: '#4338ca',
    700: '#3730a3',
    800: '#312e81',
    900: '#1e1b4b',
  },
  
  // Status colors
  status: {
    green: '#10b981',
    red: '#ef4444',
    gray: '#6b7280',
    yellow: '#f59e0b',
    blue: '#3b82f6',
  },
  
  // Neutral colors
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Semantic colors
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  }
} as const

// Device status colors
export const DEVICE_STATUS_COLORS = {
  green: {
    bg: 'bg-green-100',
    border: 'border-green-300',
    text: 'text-green-800',
    dot: 'bg-green-500',
    ring: 'ring-green-500',
  },
  red: {
    bg: 'bg-red-100',
    border: 'border-red-300',
    text: 'text-red-800',
    dot: 'bg-red-500',
    ring: 'ring-red-500',
  },
  gray: {
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-800',
    dot: 'bg-gray-500',
    ring: 'ring-gray-500',
  },
} as const

// Get device status color classes
export function getDeviceStatusColors(status: 'green' | 'red' | 'gray') {
  return DEVICE_STATUS_COLORS[status]
}

// Generate color palette for categories
export const CATEGORY_COLORS = {
  laser: 'bg-red-500',
  optics: 'bg-blue-500',
  detection: 'bg-green-500',
  motion: 'bg-purple-500',
  analysis: 'bg-indigo-500',
} as const

// Get category color
export function getCategoryColor(category: keyof typeof CATEGORY_COLORS): string {
  return CATEGORY_COLORS[category]
}

// Generate random color for unknown categories
export function getRandomColor(): string {
  const colors = [
    'bg-pink-500',
    'bg-rose-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-lime-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-violet-500',
    'bg-fuchsia-500',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// Convert RGB to hex
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

// Get contrast color (black or white) for background
export function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor)
  if (!rgb) return '#000000'
  
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return brightness > 128 ? '#000000' : '#ffffff'
}

// Generate gradient colors
export function generateGradient(from: string, to: string, steps: number): string[] {
  const fromRgb = hexToRgb(from)
  const toRgb = hexToRgb(to)
  
  if (!fromRgb || !toRgb) return [from]
  
  const gradient: string[] = []
  
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1)
    const r = Math.round(fromRgb.r + (toRgb.r - fromRgb.r) * ratio)
    const g = Math.round(fromRgb.g + (toRgb.g - fromRgb.g) * ratio)
    const b = Math.round(fromRgb.b + (toRgb.b - fromRgb.b) * ratio)
    gradient.push(rgbToHex(r, g, b))
  }
  
  return gradient
}

// Get hover color for a given color
export function getHoverColor(baseColor: string): string {
  const rgb = hexToRgb(baseColor)
  if (!rgb) return baseColor
  
  // Darken the color by 20%
  const r = Math.max(0, Math.round(rgb.r * 0.8))
  const g = Math.max(0, Math.round(rgb.g * 0.8))
  const b = Math.max(0, Math.round(rgb.b * 0.8))
  
  return rgbToHex(r, g, b)
}

// Get active color for a given color
export function getActiveColor(baseColor: string): string {
  const rgb = hexToRgb(baseColor)
  if (!rgb) return baseColor
  
  // Darken the color by 40%
  const r = Math.max(0, Math.round(rgb.r * 0.6))
  const g = Math.max(0, Math.round(rgb.g * 0.6))
  const b = Math.max(0, Math.round(rgb.b * 0.6))
  
  return rgbToHex(r, g, b)
}


