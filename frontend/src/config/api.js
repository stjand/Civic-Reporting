const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://89dde6d1-d9ff-4b76-b663-f9ac9f7bba61-00-1f667y9lpjqfn.sisko.replit.dev:3001/api'

export const apiClient = {
  get: async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`)
      if (!response.ok) throw new Error(`API Error: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('API GET Error:', error)
      throw error
    }
  },
  
  post: async (endpoint, data) => {
    try {
      // Handle FormData differently
      const isFormData = data instanceof FormData
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? data : JSON.stringify(data)
      })
      if (!response.ok) throw new Error(`API Error: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('API POST Error:', error)
      throw error
    }
  },

  put: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error(`API Error: ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('API PUT Error:', error)
      throw error
    }
  }
}

export default API_BASE_URL
