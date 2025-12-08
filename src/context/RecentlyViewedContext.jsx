import { createContext, useContext, useState, useEffect } from 'react'

const RecentlyViewedContext = createContext(null)

export const RecentlyViewedProvider = ({ children }) => {
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const MAX_RECENT = 10

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('streamflix_recently_viewed')
    if (saved) {
      try {
        setRecentlyViewed(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading recently viewed:', error)
      }
    }
  }, [])

  const addToRecentlyViewed = (movie) => {
    setRecentlyViewed(prev => {
      // Remove if already exists
      const filtered = prev.filter(m => m.id !== movie.id)
      // Add to beginning
      const updated = [movie, ...filtered].slice(0, MAX_RECENT)
      // Save to localStorage
      localStorage.setItem('streamflix_recently_viewed', JSON.stringify(updated))
      return updated
    })
  }

  const clearRecentlyViewed = () => {
    setRecentlyViewed([])
    localStorage.removeItem('streamflix_recently_viewed')
  }

  const value = {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed
  }

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  )
}

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext)
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider')
  }
  return context
}


