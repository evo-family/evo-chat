import path from 'path';
import { FileManager } from './file-manager/fileManager';
import { TAvailableModelMap, TUploadDirectoryResult, TUploadResult } from '@evo/types';
import { KnowledgeManager } from './knowledge-manager/knowledgeManager';
import { PGLiteManager } from '@evo/pglite-manager';
import { IDepManager } from './types';

interface KnowledgeServiceOptions {
  uploadDir?: string;
  /**
   * 向量数据库地址
   */
  vectorDBPath?: string;

  /**
   * 数据库地址
   */
  pgDBPath?: string;

  /**
   * 可用的嵌入模型列表
   */
  modelEmbeddingMap?: TAvailableModelMap;

  dbManager: PGLiteManager;
}

/**
 * 知识库服务
 */
export class KnowledgeService {
  private options: KnowledgeServiceOptions;
  private internalFileManager: FileManager;
  private internalKnowledgeManager: KnowledgeManager;
  private modelEmbeddingMap?: TAvailableModelMap;
  private vectorDBPath: string;

  constructor(options: KnowledgeServiceOptions) {
    const { dbManager } = options;
    this.options = options;
    const uploadDir = options.uploadDir || path.join(process.cwd(), 'uploads');
    this.vectorDBPath = options.vectorDBPath || path.join(process.cwd(), 'vector.db');

    this.modelEmbeddingMap = options.modelEmbeddingMap;
    const depManager = {} as IDepManager;
    this.internalFileManager = new FileManager({
      uploadDir,
      dbManager: options.dbManager,
      depManager,
    });
    this.internalKnowledgeManager = new KnowledgeManager({
      fileManager: this.internalFileManager,
      dbManager,
      vectorDBPath: this.vectorDBPath,
      modelEmbeddingMap: this.modelEmbeddingMap!,
      depManager,
    });
    depManager.fileManager = this.internalFileManager;
    depManager.knowledgeManager = this.internalKnowledgeManager;
  }

  get setModelEmbeddingMap() {
    return this.internalKnowledgeManager.setModelEmbeddingMap;
  }

  get fileManager() {
    return this.internalFileManager;
  }

  get knowledgeManager() {
    return this.internalKnowledgeManager;
  }
}
