import { contextBridge, ipcRenderer } from 'electron';
import {
  BaseResult,
  ElectronAPI,
  IAddFileMetaToVectorParams,
  IAddFilesMetaToVectorParams,
  IAddFileToVectorParams,
  IAddFolderToVectorParams,
  IDeleteFileParams,
  IGetFileListParams,
  IKnowledgeMeta,
  IKnowledgeVectorMeta,
  IKnowledgeVectorMetaVo,
  ISearchVectorsByKnowledge,
  IUploadBufferParams,
  TAvailableModelMap,
} from '@evo/types';
import { IpcChannels } from '../main/constants/ipcChannels';
import { ExtractChunkData } from '@llm-tools/embedjs-interfaces';
// 定义 API 类型

const __ELECTRON_API__: ElectronAPI = {
  ipcRenderer: {
    invoke: ipcRenderer.invoke.bind(ipcRenderer),
    send: ipcRenderer.send.bind(ipcRenderer),
    on: ipcRenderer.on.bind(ipcRenderer),
    removeListener: ipcRenderer.removeListener.bind(ipcRenderer),
  },
  fileService: {
    uploadFile: () => ipcRenderer.invoke('upload-file'),
    // 上传文件夹
    uploadDirectory: () => ipcRenderer.invoke('upload-directory'),

    getFileList: (params: IGetFileListParams) => ipcRenderer.invoke('get-file-list', params),
    uploadBufferFile: (params: IUploadBufferParams) =>
      ipcRenderer.invoke(IpcChannels.UPLOAD_BUFFER_FILE, params),
    getFileBuffer: (fileId: string): Promise<BaseResult<ArrayBuffer>> => {
      return ipcRenderer.invoke(IpcChannels.GET_FILE_BUFFER, fileId);
    },
    getFileContent: function (fileId: string): Promise<BaseResult<string>> {
      return ipcRenderer.invoke(IpcChannels.GET_FILE_CONTENT, fileId);
    },
    deleteFile: function (params: IDeleteFileParams): Promise<BaseResult<boolean>> {
      return ipcRenderer.invoke(IpcChannels.DELETE_FILE, params);
    },
  },
  knowledgeService: {
    create: (meta: IKnowledgeMeta) => ipcRenderer.invoke(IpcChannels.KNOWLEDGE_CREATE, meta),
    getList: function (): Promise<BaseResult<IKnowledgeMeta[]>> {
      return ipcRenderer.invoke(IpcChannels.KNOWLEDGE_GET_LIST);
    },
    update: function (meta: IKnowledgeMeta): Promise<BaseResult<IKnowledgeMeta>> {
      return ipcRenderer.invoke(IpcChannels.KNOWLEDGE_UPDATE, meta);
    },
    addFileToVector: function (
      params: IAddFileToVectorParams
    ): Promise<BaseResult<IKnowledgeVectorMeta>> {
      return ipcRenderer.invoke(IpcChannels.KNOWLEDGE_ADD_FILE_TO_VECTOR, params);
    },
    setModelEmbeddingMap: function (modelEmbeddingMap: TAvailableModelMap): void {
      ipcRenderer.invoke(IpcChannels.SET_MODEL_EMBEDDING_MAP, modelEmbeddingMap);
    },
    getVectorsByKnowledgeId: function (
      knowledgeId: string
    ): Promise<BaseResult<IKnowledgeVectorMetaVo[]>> {
      return ipcRenderer.invoke(IpcChannels.KNOWLEDGE_GET_VECTORS, knowledgeId);
    },
    searchVectors(params: ISearchVectorsByKnowledge): Promise<BaseResult<ExtractChunkData[]>> {
      return ipcRenderer.invoke(IpcChannels.KNOWLEDGE_SEARCH_VECTORS, params);
    },
    addFolderToVector: function (
      params: IAddFolderToVectorParams
    ): Promise<BaseResult<IKnowledgeVectorMeta[]>> {
      return ipcRenderer.invoke(IpcChannels.KNOWLEDGE_ADD_FOLDER_TO_VECTOR, params);
    },
    addFileMetaToVector: function (
      params: IAddFileMetaToVectorParams
    ): Promise<BaseResult<IKnowledgeVectorMeta>> {
      return ipcRenderer.invoke(IpcChannels.KNOWLEDGE_ADD_FILE_META_TO_VECTOR, params);
    },
    addFilesMetaToVector: function (
      parasm: IAddFilesMetaToVectorParams
    ): Promise<BaseResult<IKnowledgeVectorMeta[]>> {
      return ipcRenderer.invoke(IpcChannels.KNOWLEDGE_ADD_FILES_META_TO_VECTOR, parasm);
    },
    getVectorsByFileId: function (fileId: string): Promise<BaseResult<IKnowledgeVectorMeta[]>> {
      return ipcRenderer.invoke(IpcChannels.KNOWLEDGE_GET_VECTORS_BY_FILE, fileId);
    },
    deleteVectorByFileId: function (fileId: string): Promise<BaseResult<boolean>> {
      return ipcRenderer.invoke(IpcChannels.KNOWLEDGE_DELETE_VECTORS_BY_FILE, fileId);
    },
  },
};

contextBridge.exposeInMainWorld('__ELECTRON__', __ELECTRON_API__);
