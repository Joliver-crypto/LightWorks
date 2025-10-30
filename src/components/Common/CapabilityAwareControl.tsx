// Capability-aware UI control component
import React from 'react'
import { Tooltip } from './Tooltip'

interface CapabilityAwareControlProps {
  children: React.ReactNode
  capability: boolean
  reason?: string
  className?: string
}

export function CapabilityAwareControl({ 
  children, 
  capability, 
  reason = 'Not available on this platform/driver',
  className = ''
}: CapabilityAwareControlProps) {
  const disabled = !capability

  if (disabled) {
    return (
      <Tooltip content={`${reason}. Connect to a Windows/Linux capture node to enable.`}>
        <div className={`opacity-50 pointer-events-none ${className}`}>
          {children}
        </div>
      </Tooltip>
    )
  }

  return <>{children}</>
}

// Capability-aware input component
interface CapabilityAwareInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  capability: boolean
  reason?: string
}

export function CapabilityAwareInput({ 
  capability, 
  reason,
  className = '',
  ...props 
}: CapabilityAwareInputProps) {
  const disabled = !capability || props.disabled

  return (
    <Tooltip content={disabled && !props.disabled ? `${reason}. Connect to a Windows/Linux capture node to enable.` : ''}>
      <input
        {...props}
        disabled={disabled}
        className={`${className} ${disabled && !props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
    </Tooltip>
  )
}

// Capability-aware button component
interface CapabilityAwareButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  capability: boolean
  reason?: string
}

export function CapabilityAwareButton({ 
  capability, 
  reason,
  className = '',
  children,
  ...props 
}: CapabilityAwareButtonProps) {
  const disabled = !capability || props.disabled

  return (
    <Tooltip content={disabled && !props.disabled ? `${reason}. Connect to a Windows/Linux capture node to enable.` : ''}>
      <button
        {...props}
        disabled={disabled}
        className={`${className} ${disabled && !props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {children}
      </button>
    </Tooltip>
  )
}

// Capability-aware select component
interface CapabilityAwareSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  capability: boolean
  reason?: string
}

export function CapabilityAwareSelect({ 
  capability, 
  reason,
  className = '',
  children,
  ...props 
}: CapabilityAwareSelectProps) {
  const disabled = !capability || props.disabled

  return (
    <Tooltip content={disabled && !props.disabled ? `${reason}. Connect to a Windows/Linux capture node to enable.` : ''}>
      <select
        {...props}
        disabled={disabled}
        className={`${className} ${disabled && !props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {children}
      </select>
    </Tooltip>
  )
}





