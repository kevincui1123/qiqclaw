import { apiClient, ApiResponse } from '../client'


interface CheckUpdateResponse {
  hasUpdate: boolean
  version?: string
  downloadUrl?: string
  forceUpdate?: boolean
  description?: string
  updateTime?: string
  message?: string
}


export class VersionService {
 
  async checkUpdate(): Promise<ApiResponse<CheckUpdateResponse>> {
    return apiClient.get<CheckUpdateResponse>('/api/version/checkUpdate')
  }
}


export const versionService = new VersionService()
