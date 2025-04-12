import { ipcMain, shell } from 'electron'
import { IpcChannels } from '../constants/ipcChannels'
import { CommonService } from '../services/CommonService'

const commonService = new CommonService()

export function setupCommonHandlers() {
  ipcMain.handle(IpcChannels.COMMON_GET_NATIVE_THEME, async (event) => {
    return commonService.getTheme()
  })

  ipcMain.handle(IpcChannels.COMMON_ON_NATIVE_THEME_CHANGE, async (event, params) => {
    return commonService.onThemeChange(params)
  })

  ipcMain.handle(IpcChannels.COMMON_OPEN_EXTERNAL, async (event, url, options) => {
    commonService.openExternal(url, options)
  })
}
