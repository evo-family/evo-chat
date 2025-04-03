import path from 'path';
import { FileManager } from './file-manager/fileManager';
import { TAvailableModelMap, TUploadDirectoryResult, TUploadResult } from '@evo/types';
import { KnowledgeManager } from './knowledge-manager/knowledgeManager';
import { SchemaManager } from '@evo/pglite-manager';

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
}

/**
 * 知识库服务
 */
export class KnowledgeService {
  private options: KnowledgeServiceOptions;
  private internalFileManager: FileManager;
  private schemaManager: SchemaManager;
  private internalKnowledgeManager: KnowledgeManager;
  private modelEmbeddingMap?: TAvailableModelMap;
  private vectorDBPath: string;
  private pgDBPath: string;

  constructor(options: KnowledgeServiceOptions) {
    this.options = options;
    const uploadDir = options.uploadDir || path.join(process.cwd(), 'uploads');
    this.vectorDBPath = options.vectorDBPath || path.join(process.cwd(), 'vector.db');;
    this.pgDBPath = options.pgDBPath || path.join(process.cwd(), 'db.sqlite');

    this.modelEmbeddingMap = options.modelEmbeddingMap;
    this.schemaManager = SchemaManager.getInstance(this.pgDBPath);

    const dbManager = this.schemaManager.getDbManager();
    this.internalFileManager = new FileManager(uploadDir, dbManager);
    this.internalKnowledgeManager = new KnowledgeManager({
      fileManager: this.internalFileManager,
      dbManager: dbManager,
      vectorDBPath: this.vectorDBPath,
      modelEmbeddingMap: this.modelEmbeddingMap!
    })
  }

  get setModelEmbeddingMap() {
    return this.internalKnowledgeManager.setModelEmbeddingMap
  }

  get fileManager() {
    return this.internalFileManager;
  }

  get knowledgeManager() {
    return this.internalKnowledgeManager;
  }



  /**
 * 关闭数据库连接
 */
  public async close(): Promise<void> {
    await this.schemaManager.close();
  }
}

