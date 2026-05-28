
type AuthStateChangeCallback = (isLoggedIn: boolean) => void

let authStateChangeCallbacks: AuthStateChangeCallback[] = []

export function onAuthStateChange(callback: AuthStateChangeCallback): () => void {
  authStateChangeCallbacks.push(callback)
  return () => {
    authStateChangeCallbacks = authStateChangeCallbacks.filter(cb => cb !== callback)
  }
}


export function notifyAuthStateChange(isLoggedIn: boolean): void {
  authStateChangeCallbacks.forEach(callback => {
    try {
      callback(isLoggedIn)
    } catch (error) {
      console.error('Auth state change callback error:', error)
    }
  })
}
