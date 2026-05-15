import request from '@/config/axios'

export function getCameras(params: any) {
   return request.get({ url: '/biz/device/camera/list', params })
}

export function updateCameraStatus(id: any, params: any) {
  return request.put({ url: `/biz/device/camera/status/${id}`, params })
}

export function deleteCamera(id: any) {
   return request.delete({ url: `/biz/device/camera/${id}` })
}

export function createDevice(data: any) {
  return request.post({ url: '/biz/device/camera/create', data })
}

export function getCameraStat(params: any) {
 return request.get({ url: '/biz/device/camera/getCameraStat', params })
}

export function getAreas() {
  return request.get({ url: '/biz/device/area/options'})
}
