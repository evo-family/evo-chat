import { EResourceType, IVectorProgress, TUploadDirectoryResult, TUploadResult } from './file';
import {
  IFileMeta,
  IKnowledgeMeta,
  IKnowledgeVectorMeta,
  IKnowledgeVectorMetaVo,
  IMcpCategoryMeta,
  IMcpMeta,
} from './meta';

import { BaseResult } from './common';
import { EThemeMode, MobilePermissionType } from './setting';
import { ExtractChunkData } from '@llm-tools/embedjs-interfaces';
import { TAvailableModelMap } from './model';
import { Tool } from '@modelcontextprotocol/sdk/types.js';

export interface IUploadBufferParams {
  fileBuffer: ArrayBuffer;
  fileMeta: Partial<IFileMeta>;
}

export interface IDeleteFileParams {
  fileId: string;
  /**
   * 是否把知识库一并删除
   */
  isDeleteKnowledge?: boolean;
}
export interface IFileService {
  uploadFile(): Promise<TUploadResult>;
  uploadDirectory(): Promise<TUploadDirectoryResult>;
  getFileList(params: IGetFileListParams): Promise<BaseResult<IFileMeta[]>>;
  uploadBufferFile(params: IUploadBufferParams): Promise<BaseResult<IFileMeta>>;
  getFileBuffer(fileId: string): Promise<BaseResult<ArrayBuffer>>;
  getFileContent(fileId: string): Promise<BaseResult<string>>;
  deleteFile(params: IDeleteFileParams): Promise<BaseResult<boolean>>;
}

export interface IAddFileToVectorParams {
  filePath?: string;
  knowledgeId: string;
}

export interface IAddFileMetaToVectorParams {
  fileMeta: IFileMeta;
  knowledgeId: string;
}

export interface IAddFolderToVectorParams {
  knowledgeId: string;
  dirPath?: string;
  onProgress?: (progress: IVectorProgress) => void;
  /**
   * 并发数
   */
  concurrency?: number;
}

export interface IAddFilesMetaToVectorParams {
  fileMetas: IFileMeta[];
  knowledgeId: string;
  onProgress?: (progress: IVectorProgress) => void;
  concurrency?: number;
}

export interface ISearchVectorsByKnowledge {
  knowledgeId: string;
  searchValue: string;
}
export interface IKnowledgeService {
  setModelEmbeddingMap(modelEmbeddingMap: TAvailableModelMap): void;

  create(meta: IKnowledgeMeta): Promise<BaseResult<IKnowledgeMeta>>;

  getList(): Promise<BaseResult<IKnowledgeMeta[]>>;

  update(meta: IKnowledgeMeta): Promise<BaseResult<IKnowledgeMeta>>;

  /**
   * 知识库添加文件到向量库
   * @param filePath
   * @param knowledgeId
   */
  addFileToVector(params: IAddFileToVectorParams): Promise<BaseResult<IKnowledgeVectorMeta>>;

  /**
   *  将目录上传到向量库
   * @param dirPath
   * @param knowledgeId
   * @param onProgress
   * @param concurrency
   */
  addFolderToVector(params: IAddFolderToVectorParams): Promise<BaseResult<IKnowledgeVectorMeta[]>>;

  /**
   * 已上传的文件添加到向量库
   * @param params
   */
  addFileMetaToVector(
    params: IAddFileMetaToVectorParams
  ): Promise<BaseResult<IKnowledgeVectorMeta>>;

  /**
   *已上传的多个文件添加到向量库
   * @param parasm
   */
  addFilesMetaToVector(
    parasm: IAddFilesMetaToVectorParams
  ): Promise<BaseResult<IKnowledgeVectorMeta[]>>;

  /**
   * 根据知识库id获取向量列表
   * @param knowledgeId
   */
  getVectorsByKnowledgeId(knowledgeId: string): Promise<BaseResult<IKnowledgeVectorMetaVo[]>>;

  /**
   * 根据知识库id和查询语句搜索向量
   * 搜索相似内容的函数
   * @param params
   */
  searchVectors(params: ISearchVectorsByKnowledge): Promise<BaseResult<ExtractChunkData[]>>;

  /**
   * 根据文件id获取向量信息
   * @param fileId
   */
  getVectorsByFileId(fileId: string): Promise<BaseResult<IKnowledgeVectorMeta[]>>;

  /**
   * 根据文件id删除向量信息
   * @param fileId
   */
  deleteVectorByFileId(fileId: string): Promise<BaseResult<boolean>>;
}

export interface ICommonService {
  getTheme(): Promise<EThemeMode>;
  onThemeChange(callback: (theme: EThemeMode) => void): void;
  openExternal: (url: string, options?: any) => void;
  getVersion(): Promise<string>;
  checkMobilePermission?(permissions: MobilePermissionType[]): Promise<boolean>;
}

export interface ICliService {
  checkBunCommand(): Promise<BaseResult<boolean>>;
  checkUvCommand(): Promise<BaseResult<boolean>>;
  getCommandPath(command: string): Promise<BaseResult<string | null>>;
  installCommand(command: string): Promise<BaseResult<boolean>>;
}

export interface IMcpService {
  // 分类相关方法
  createCategory(meta: Partial<IMcpCategoryMeta>): Promise<BaseResult<IMcpCategoryMeta>>;
  updateCategory(meta: IMcpCategoryMeta): Promise<BaseResult<IMcpCategoryMeta>>;
  deleteCategory(id: string): Promise<BaseResult<boolean>>;
  getCategoryList(): Promise<BaseResult<IMcpCategoryMeta[]>>;
  getCategoryById(id: string): Promise<BaseResult<IMcpCategoryMeta | null>>;

  // MCP 项目相关方法
  createMcp(meta: IMcpMeta): Promise<BaseResult<IMcpMeta>>;
  updateMcp(meta: IMcpMeta): Promise<BaseResult<IMcpMeta>>;
  deleteMcp(id: string): Promise<BaseResult<boolean>>;
  getMcpList(): Promise<BaseResult<IMcpMeta[]>>;
  getMcpById(id: string): Promise<BaseResult<IMcpMeta | null>>;
  getMcpListByCategoryId(categoryId: string): Promise<BaseResult<IMcpMeta[]>>;

  // 服务控制方法
  startService(mcpId: string): Promise<BaseResult<boolean>>;
  stopService(mcpId: string): Promise<BaseResult<boolean>>;
  getServiceStatus(mcpId: string): Promise<BaseResult<boolean>>;

  // 工具方法
  getTools(mcpId: string): Promise<BaseResult<Tool[]>>;
}

export interface IGetFileListParams {
  type: EResourceType;
  search?: string;
}
export interface ElectronAPI {
  ipcRenderer: {
    invoke(channel: string, ...args: any[]): Promise<any>;
    send(channel: string, ...args: any[]): void;
    on(channel: string, listener: (...args: any[]) => void): void;
    removeListener(channel: string, listener: (...args: any[]) => void): void;
  };
  fileService: IFileService;
  knowledgeService: IKnowledgeService;

  commonService: ICommonService;
}

// 确保文件被视为模块
