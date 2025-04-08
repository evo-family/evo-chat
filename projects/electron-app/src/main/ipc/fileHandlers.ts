import { ipcMain, app, dialog } from 'electron'
import { KnowledgeService } from '@evo/knowledge-service'
import path from 'path'
import { ElectronFileService } from '../services/ElectronFileService'
import { IpcChannels } from '../constants/ipcChannels'
import { logger } from '../logger'

// 初始化知识库服务
const knowledgeService = new KnowledgeService({
  uploadDir: path.join(app.getPath('userData'), 'knowledge-data', 'upload-files'),
  vectorDBPath: path.join(app.getPath('userData'), 'knowledge-data', 'vector-db'),
  pgDBPath: path.join(app.getPath('userData'), 'knowledge-data', 'pg-db')
})

logger.info('save-data-path:', path.join(app.getPath('userData'), 'knowledge-data'))

const fileService = new ElectronFileService(knowledgeService)

export function setupFileHandlers(): void {
  // 文件相关
  ipcMain.handle(IpcChannels.UPLOAD_FILE, () => fileService.uploadFile())
  ipcMain.handle(IpcChannels.UPLOAD_DIRECTORY, () => fileService.uploadDirectory())
  ipcMain.handle(IpcChannels.GET_FILE_LIST, (event, params) =>
    knowledgeService.fileManager.getFileList(params)
  )
  ipcMain.handle(IpcChannels.UPLOAD_BUFFER_FILE, (event, params) =>
    knowledgeService.fileManager.uploadBufferFile(params)
  )
  ipcMain.handle(IpcChannels.GET_FILE_BUFFER, (event, fileId) =>
    knowledgeService.fileManager.getFileBuffer(fileId)
  )
  ipcMain.handle(IpcChannels.GET_FILE_CONTENT, async (event, fileId) => {
    return await knowledgeService.fileManager.getFileContent(fileId)
  })

  ipcMain.handle(IpcChannels.DELETE_FILE, (event, params) => {
    return knowledgeService.fileManager.deleteFile(params)
  })

  ipcMain.handle('set-model-embedding-map', (event, params) => {
    knowledgeService.setModelEmbeddingMap(params)
  })

  // 知识库相关
  ipcMain.handle(IpcChannels.KNOWLEDGE_CREATE, (event, params) => {
    return knowledgeService.knowledgeManager.create(params)
  })

  ipcMain.handle(IpcChannels.KNOWLEDGE_UPDATE, (event, params) =>
    knowledgeService.knowledgeManager.update(params)
  )

  ipcMain.handle(IpcChannels.KNOWLEDGE_GET_LIST, () => knowledgeService.knowledgeManager.getList())

  ipcMain.handle(IpcChannels.KNOWLEDGE_ADD_FILE_TO_VECTOR, async (event, params) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile']
    })
    if (canceled || filePaths.length === 0) {
      return { success: false, error: '用户取消了操作' }
    }
    return await knowledgeService.knowledgeManager.addFileToVector({
      ...params,
      filePath: filePaths[0]
    })
  })

  // 添加文件夹
  ipcMain.handle(IpcChannels.KNOWLEDGE_ADD_FOLDER_TO_VECTOR, async (event, params) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (canceled || filePaths.length === 0) {
      return { success: false, error: '用户取消了操作' }
    }
    return await knowledgeService.knowledgeManager.addFolderToVector({
      ...params,
      dirPath: filePaths[0]
    })
  })

  // 添加已存在的单个文件
  ipcMain.handle(IpcChannels.KNOWLEDGE_ADD_FILE_META_TO_VECTOR, async (event, params) => {
    return await knowledgeService.knowledgeManager.addFileMetaToVector(params)
  })

  // 添加已存在的多个文件
  ipcMain.handle(IpcChannels.KNOWLEDGE_ADD_FILES_META_TO_VECTOR, async (event, params) => {
    return await knowledgeService.knowledgeManager.addFilesMetaToVector(params)
  })

  ipcMain.handle(IpcChannels.KNOWLEDGE_GET_VECTORS, async (event, params) => {
    return await knowledgeService.knowledgeManager.getVectorsByKnowledgeId(params)
  })

  ipcMain.handle(IpcChannels.KNOWLEDGE_SEARCH_VECTORS, async (event, params) => {
    return await knowledgeService.knowledgeManager.searchVectors(params)
  })
  ipcMain.handle(IpcChannels.KNOWLEDGE_GET_VECTORS_BY_FILE, async (event, params) => {
    return await knowledgeService.knowledgeManager.getVectorsByFileId(params)
  })

  ipcMain.handle(IpcChannels.KNOWLEDGE_DELETE_VECTORS_BY_FILE, async (event, params) => {
    return await knowledgeService.knowledgeManager.deleteVectorByFileId(params)
  })
}
