import type { AxiosHeaders } from 'axios'

const runtimeConfig = (window as any).RUNTIME_CONFIG || {};

const config: {
  base_url: string
  result_code: number | string
  default_headers: AxiosHeaders | string
  request_timeout: number
} = {
  base_url: runtimeConfig.VITE_BASE_URL || '',
  result_code: 200,
  request_timeout: 300000,
  default_headers: 'application/json'
}

export { config }
