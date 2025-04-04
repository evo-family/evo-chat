import { dialog } from 'electron'
import { TUploadResult, TUploadDirectoryResult } from '@evo/types'
import { KnowledgeService } from '@evo/knowledge-service'
import { logger } from '../logger'

export class ElectronFileService {
  constructor(private knowledgeService: KnowledgeService) {}

  async uploadFile(): Promise<TUploadResult> {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile']
      })

      if (canceled || filePaths.length === 0) {
        return { success: false, error: '用户取消了操作' }
      }

      logger.info('filePaths', filePaths[0])
      return await this.knowledgeService.fileManager.uploadFile(filePaths[0])
    } catch (error) {
      console.error('上传文件错误:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  async uploadDirectory(): Promise<TUploadDirectoryResult> {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory']
      })

      if (canceled || filePaths.length === 0) {
        return { success: false, error: '用户取消了操作' }
      }

      return await this.knowledgeService.fileManager.uploadDirectory(filePaths[0])
    } catch (error) {
      console.error('上传文件夹错误:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }
}
