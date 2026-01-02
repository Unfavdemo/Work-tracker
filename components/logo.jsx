'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function Logo({ className = '', showText = true, size = 'default' }) {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('dark')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      const effectiveTheme = theme === 'system' ? systemTheme : theme
      setCurrentTheme(effectiveTheme || 'dark')
    }
  }, [theme, systemTheme, mounted])

  if (!mounted) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 animate-pulse" />
        {showText && (
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        )}
      </div>
    )
  }

  const logoSrc = showText
    ? currentTheme === 'light'
      ? '/logo-light.svg'
      : '/logo-dark.svg'
    : currentTheme === 'light'
    ? '/icon-light-32x32.svg'
    : '/icon-dark-32x32.svg'

  const dimensions = size === 'small' 
    ? { width: showText ? 120 : 24, height: showText ? 36 : 24 }
    : size === 'large'
    ? { width: showText ? 240 : 48, height: showText ? 72 : 48 }
    : { width: showText ? 200 : 40, height: showText ? 60 : 40 }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={logoSrc}
        alt="Workshop Tracker"
        width={dimensions.width}
        height={dimensions.height}
        className="object-contain"
        style={{ width: dimensions.width, height: dimensions.height }}
      />
    </div>
  )
}

// Icon-only version for favicons and small spaces
export function LogoIcon({ className = '', size = 32 }) {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('dark')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      const effectiveTheme = theme === 'system' ? systemTheme : theme
      setCurrentTheme(effectiveTheme || 'dark')
    }
  }, [theme, systemTheme, mounted])

  if (!mounted) {
    return (
      <div 
        className={`rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 animate-pulse ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  const iconSrc = currentTheme === 'light'
    ? '/icon-light-32x32.svg'
    : '/icon-dark-32x32.svg'

  return (
    <img
      src={iconSrc}
      alt="Workshop Tracker"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

