'use client'

import React, { createContext, useState, useContext } from 'react'

interface VisibilityContextType {
  isVisible: boolean
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const VisibilityContext = createContext<VisibilityContextType | undefined>(undefined)

export const VisibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true)

  return (
    <VisibilityContext.Provider value={{ isVisible, setIsVisible }}>
      {children}
    </VisibilityContext.Provider>
  )
}

export const useVisibility = () => {
  const context = useContext(VisibilityContext)
  if (context === undefined) {
    throw new Error('useVisibility must be used within a VisibilityProvider')
  }
  return context
}

