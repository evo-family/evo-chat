import { platform } from 'os'

// 获取当前操作系统平台
const currentPlatform = platform()

// 判断是否为 Windows
export const isWindows = (): boolean => {
  return currentPlatform === 'win32'
}

// 判断是否为 macOS
export const isMacOS = (): boolean => {
  return currentPlatform === 'darwin'
}

// 判断是否为 Linux
export const isLinux = (): boolean => {
  return currentPlatform === 'linux'
}

// 获取当前平台
export const getPlatform = (): string => {
  return currentPlatform
}
