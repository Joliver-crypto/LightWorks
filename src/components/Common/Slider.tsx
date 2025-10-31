import React from 'react'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (value: number) => void
  disabled?: boolean
  className?: string
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  disabled = false,
  className = ''
}: SliderProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <label className="text-xs font-medium text-gray-300 w-20 text-right">
        {label}:
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed slider"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value - min) / (max - min)) * 100}%, #374151 ${((value - min) / (max - min)) * 100}%, #374151 100%)`
        }}
      />
      <div className="flex items-center gap-1 w-24">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || min)}
          disabled={disabled}
          className="w-16 px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white text-right"
        />
        {unit && <span className="text-xs text-gray-400 w-8">{unit}</span>}
      </div>
    </div>
  )
}

