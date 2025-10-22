import { useEffect, useState } from 'react'

export function useDemoMode() {
  const [isDemo, setIsDemo] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkDemoMode() {
      try {
        const response = await fetch('/api/user/demo-status')
        if (response.ok) {
          const data = await response.json()
          setIsDemo(data.isDemo || false)
        } else {
          setIsDemo(false)
        }
      } catch (error) {
        console.error('Error checking demo mode:', error)
        setIsDemo(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkDemoMode()
  }, [])

  return { isDemo, isLoading }
}
