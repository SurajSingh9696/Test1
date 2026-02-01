import { createContext, useContext, useState, useCallback } from 'react'

const ConversionContext = createContext()

export function ConversionProvider({ children }) {
    const [conversions, setConversions] = useState([])
    const [currentConversion, setCurrentConversion] = useState(null)

    const addConversion = useCallback((conversion) => {
        const newConversion = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            status: 'pending',
            ...conversion
        }
        setConversions(prev => [newConversion, ...prev])
        return newConversion.id
    }, [])

    const updateConversion = useCallback((id, updates) => {
        setConversions(prev =>
            prev.map(conv =>
                conv.id === id ? { ...conv, ...updates } : conv
            )
        )
    }, [])

    const removeConversion = useCallback((id) => {
        setConversions(prev => prev.filter(conv => conv.id !== id))
    }, [])

    const clearHistory = useCallback(() => {
        setConversions([])
    }, [])

    const getRecentConversions = useCallback((limit = 10) => {
        return conversions.slice(0, limit)
    }, [conversions])

    const value = {
        conversions,
        currentConversion,
        setCurrentConversion,
        addConversion,
        updateConversion,
        removeConversion,
        clearHistory,
        getRecentConversions
    }

    return (
        <ConversionContext.Provider value={value}>
            {children}
        </ConversionContext.Provider>
    )
}

export function useConversion() {
    const context = useContext(ConversionContext)
    if (!context) {
        throw new Error('useConversion must be used within a ConversionProvider')
    }
    return context
}
