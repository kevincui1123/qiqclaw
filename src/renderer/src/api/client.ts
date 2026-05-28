import { getStoredToken, clearStoredToken } from './token'
import { notifyAuthStateChange } from './auth'

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'


interface ApiResponse<T = any> {
  code: number
  message?: string
  data?: T
}


interface RequestConfig extends RequestInit {
  skipAuth?: boolean
  skipRefresh?: boolean
}


function handleTokenExpired(): void {
  clearStoredToken()
  notifyAuthStateChange(false)
}


class ApiClient {
  async request<T = any>(
    url: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { skipAuth = false, skipRefresh = false, headers = {}, ...restConfig } = config

    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    }

    if (!skipAuth) {
      const token = getStoredToken()
      if (token) {
        requestHeaders['Authorization'] = token
      }
    }

    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`

    try {
      let response = await fetch(fullUrl, {
        ...restConfig,
        headers: requestHeaders,
      })

      if (!skipAuth && (response.status === 401 || response.status === 403)) {
        handleTokenExpired()
        throw new Error('Token 已失效，请重新登录')
      }
      
      const data: ApiResponse<T> = await response.json()

      if (data.code !== undefined && data.code !== 0 && data.code !== 1000) {
        if (data.code === 401 || data.code === 403) {
          handleTokenExpired()
        }
        throw new Error(data.message || '请求失败')
      }

      return data
    } catch (error: any) {
      if (error.message && !error.message.includes('Token')) {
        throw error
      }
      throw error
    }
  }

  async get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' })
  }


  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }


  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }


  async delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' })
  }
}


export const apiClient = new ApiClient()


export type { ApiResponse, RequestConfig }
