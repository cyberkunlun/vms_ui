import axios, { AxiosError } from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { config } from './config'
import { getAccessToken } from '@/utils/auth'

const service: AxiosInstance = axios.create({
  baseURL: config.base_url,
  timeout: config.request_timeout,
  withCredentials: false
})

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = 'Bearer ' + token
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse<any>) => {
    return response.data
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

export { service }
