export const getAccessToken = () => {
  return sessionStorage.getItem('ACCESS_TOKEN') || 'mock-token'
}

export const getRefreshToken = () => {
  return sessionStorage.getItem('REFRESH_TOKEN')
}

export const setToken = (token: { accessToken: string; refreshToken: string }) => {
  sessionStorage.setItem('ACCESS_TOKEN', token.accessToken)
  sessionStorage.setItem('REFRESH_TOKEN', token.refreshToken)
}

export const removeToken = () => {
  sessionStorage.removeItem('ACCESS_TOKEN')
  sessionStorage.removeItem('REFRESH_TOKEN')
}
