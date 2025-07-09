'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type WeightUnit = 'lbs' | 'kg'

interface SettingsContextType {
  weightUnit: WeightUnit
  setWeightUnit: (unit: WeightUnit) => void
  convertWeight: (weight: number, toUnit?: WeightUnit) => number
  formatWeight: (weight: number) => string
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [weightUnit, setWeightUnitState] = useState<WeightUnit>('lbs')

  useEffect(() => {
    // Load saved preference
    const saved = localStorage.getItem('weightUnit') as WeightUnit
    if (saved === 'kg' || saved === 'lbs') {
      setWeightUnitState(saved)
    }
  }, [])

  const setWeightUnit = (unit: WeightUnit) => {
    setWeightUnitState(unit)
    localStorage.setItem('weightUnit', unit)
  }

  const convertWeight = (weight: number, toUnit: WeightUnit = weightUnit): number => {
    if (toUnit === 'kg') {
      return weight / 2.20462 // lbs to kg
    }
    return weight // already in lbs
  }

  const formatWeight = (weight: number): string => {
    const converted = convertWeight(weight)
    return `${converted.toFixed(1)} ${weightUnit}`
  }

  return (
    <SettingsContext.Provider value={{ weightUnit, setWeightUnit, convertWeight, formatWeight }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}