import {
  BaseResult,
  IAddFileMetaToVectorParams,
  IAddFilesMetaToVectorParams,
  IAddFileToVectorParams,
  IAddFolderToVectorParams,
  IDeleteVectorParams,
  IFileMeta,
  IKnowledgeMeta,
  IKnowledgeService,
  IKnowledgeVectorMeta,
  IKnowledgeVectorMetaVo,
  ISearchVectorsByKnowledge,
  TAvailableModelMap,
} from '@evo/types';

import { FileManager } from '../file-manager/fileManager';
import path from 'path';
import { createBaseMeta, getModelConfig, ResultUtil } from '@evo/utils';
import { ErrorCode, KnowledgeError } from '../utils/errors';
import { RAGAppManager } from '../rag-manager/ragAppManager';
import { ExtractChunkData } from '@llm-tools/embedjs-interfaces';
import { PGLiteManager } from '@evo/pglite-manager';
import { IDepManager } from '../types';

export interface IKnowledgeManagerOptions {
  dbManager: PGLiteManager;
  fileManager: FileManager;
  vectorDBPath: string;
  modelEmbeddingMap: TAvailableModelMap;
  depManager: IDepManager;
}

export class KnowledgeManager implements IKnowledgeService {
  private dbManager: PGLiteManager;
  private fileManager: FileManager;
  private vectorDBPath: string;
  private modelEmbeddingMap: TAvailableModelMap;
  private depManager: IDepManager;

  constructor(options: IKnowledgeManagerOptions) {
    const { dbManager, fileManager, vectorDBPath, modelEmbeddingMap, depManager } = options;
    this.dbManager = dbManager;
    this.fileManager = fileManager;
    this.vectorDBPath = vectorDBPath;
    this.modelEmbeddingMap = modelEmbeddingMap;
    this.depManager = depManager;
  }

  public setModelEmbeddingMap = (modelEmbeddingMap: TAvailableModelMap) => {
    this.modelEmbeddingMap = modelEmbeddingMap;
  };

  private getRagPath = (knowledgeId: string) => {
    return path.join(this.vectorDBPath, knowledgeId);
  };

  private getRagManager = async (knowledgeId: string) => {
    const knowledge = await this.findById(knowledgeId);
    const modelConfig = getModelConfig({
      modelMap: this.modelEmbeddingMap,
      providerId: knowledge?.modelProviderId!,
      modelId: knowledge?.modelId!,
    });
    if (!modelConfig) {
      throw new KnowledgeError(ErrorCode.MODEL_CONFIG_NOT_FOUND);
    }
    // 确保 API URL 以 /v1 结尾
    if (modelConfig.url && !modelConfig.url.endsWith('/v1/')) {
      modelConfig.url = `${modelConfig.url}/v1/`;
    }
    return RAGAppManager.getInstance(this.getRagPath(knowledgeId)).setEmbeddingConfig(modelConfig);
  };

  async findById(knowledgeId: string): Promise<IKnowledgeMeta | null> {
    return this.dbManager.findById('knowledge', knowledgeId);
  }

  /**
   * 创建知识库
   */
  async create(meta: IKnowledgeMeta): Promise<BaseResult<IKnowledgeMeta>> {
    try {
      const knowledge: IKnowledgeMeta = createBaseMeta(meta);

      await this.dbManager.insert('knowledge', knowledge);
      return ResultUtil.success(knowledge);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  async getList(): Promise<BaseResult<IKnowledgeMeta[]>> {
    try {
      const result = await this.dbManager.find<IKnowledgeMeta>('knowledge');
      return ResultUtil.success(result);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }
  async update(meta: IKnowledgeMeta): Promise<BaseResult<IKnowledgeMeta>> {
    try {
      const result = await this.dbManager.updateById<IKnowledgeMeta>('knowledge', meta.id, meta);
      return ResultUtil.success(result!);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  private async processFileVector(
    ragManager: RAGAppManager,
    fileMeta: IFileMeta,
    knowledgeId: string
  ): Promise<IKnowledgeVectorMeta> {
    try {
      // 1. 添加文件到 RAG
      const loadData = await ragManager.addLoader(fileMeta);
      if (!loadData) {
        throw new KnowledgeError(ErrorCode.FILE_VECTOR_FAILED);
      }
      // 2. 记录向量化信息
      const vectorMeta: IKnowledgeVectorMeta = createBaseMeta({
        fileId: fileMeta.id,
        loaderId: loadData?.uniqueId, // 使用文件ID作为loaderId
        loaderType: loadData?.loaderType,
        knowledgeId,
      });

      // 3. 保存到数据库
      await this.dbManager.insert('knowledge_vector', vectorMeta);

      return vectorMeta;
    } catch (error) {
      console.log(error);
      throw new KnowledgeError(ErrorCode.OPERATION_ERROR);
    }
  }

  /**
   * 将文件添加到向量库
   */
  async addFileToVector(params: IAddFileToVectorParams): Promise<BaseResult<IKnowledgeVectorMeta>> {
    try {
      const { knowledgeId, filePath } = params;
      const ragManager = await this.getRagManager(knowledgeId);
      const uploadData = await this.fileManager.uploadFile(filePath!);
      const result = await this.processFileVector(ragManager, uploadData.data!, knowledgeId);
      return ResultUtil.success(result!);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  /**
   * 将已上传的文件添加到向量库
   */
  async addFileMetaToVector(
    params: IAddFileMetaToVectorParams
  ): Promise<BaseResult<IKnowledgeVectorMeta>> {
    try {
      const { knowledgeId, fileMeta } = params;
      const ragManager = await this.getRagManager(knowledgeId);
      const result = await this.processFileVector(ragManager, fileMeta, knowledgeId);
      return ResultUtil.success(result);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  /**
   * 将批量已上传的文件添加到向量库（并发处理）
   */
  async addFilesMetaToVector(
    params: IAddFilesMetaToVectorParams
  ): Promise<BaseResult<IKnowledgeVectorMeta[]>> {
    const { fileMetas, knowledgeId, onProgress, concurrency = 10 } = params;
    try {
      const ragManager = await this.getRagManager(knowledgeId);
      const results: IKnowledgeVectorMeta[] = [];
      const total = fileMetas.length;
      let success = 0;
      let failed = 0;
      let current = 0;

      const updateProgress = (file?: IFileMeta) => {
        current++;
        onProgress?.({
          current,
          total,
          success,
          failed,
          file,
        });
      };

      const processFile = async (fileMeta: IFileMeta) => {
        try {
          const result = await this.processFileVector(ragManager, fileMeta, knowledgeId);
          // 移除这里的 results.push
          success++;
          updateProgress(fileMeta);
          return result;
        } catch (error) {
          console.error(`文件 ${fileMeta.name} 向量化失败:`, error);
          failed++;
          updateProgress(fileMeta);
          return null;
        }
      };

      const chunks = [];
      for (let i = 0; i < fileMetas.length; i += concurrency) {
        chunks.push(fileMetas.slice(i, i + concurrency));
      }

      for (const chunk of chunks) {
        const chunkResults = await Promise.all(chunk.map((file) => processFile(file)));
        results.push(...(chunkResults.filter(Boolean) as IKnowledgeVectorMeta[]));
      }

      return ResultUtil.success(results);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  /**
   * 上传目录并添加到向量库
   */
  async addFolderToVector(
    params: IAddFolderToVectorParams
  ): Promise<BaseResult<IKnowledgeVectorMeta[]>> {
    try {
      const { dirPath, knowledgeId, onProgress, concurrency = 10 } = params;
      // 1. 上传目录中的所有文件
      const uploadResult = await this.fileManager.uploadDirectory(dirPath!);
      if (!uploadResult.success || !uploadResult.data) {
        throw new KnowledgeError(ErrorCode.FILE_UPLOAD_FAILED);
      }

      // 2. 将上传的文件添加到向量库
      const result = await this.addFilesMetaToVector({
        fileMetas: uploadResult.data,
        knowledgeId,
        onProgress,
        concurrency,
      });
      return result;
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  /**
   * 获取知识库的向量信息
   */
  async getVectorsByKnowledgeId(
    knowledgeId: string
  ): Promise<BaseResult<IKnowledgeVectorMetaVo[]>> {
    try {
      const sql = `
        SELECT kv.*, f.id as file_id, f.name as file_name, f.path as file_path, f.size as file_size, f.type as file_type
        FROM knowledge_vector kv
        LEFT JOIN files f ON kv.file_id = f.id
        WHERE kv.knowledge_id = $1
        ORDER BY kv.create_time DESC
      `;

      const result = await this.dbManager.query(sql, [knowledgeId]);
      return ResultUtil.success(result.rows);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  async searchVectors(params: ISearchVectorsByKnowledge): Promise<BaseResult<ExtractChunkData[]>> {
    try {
      const { knowledgeId, searchValue } = params;
      const rag = await this.getRagManager(knowledgeId);
      const result = await rag.search(searchValue);
      return ResultUtil.success(result);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  async getVectorsByFileId(fileId: string): Promise<BaseResult<IKnowledgeVectorMeta[]>> {
    try {
      const sql = `
        SELECT kv.*
        FROM knowledge_vector kv
        WHERE kv.file_id = $1
        ORDER BY kv.create_time DESC
      `;

      const result = await this.dbManager.query(sql, [fileId]);
      return ResultUtil.success(result?.rows || []);
    } catch (error) {
      return ResultUtil.error(error);
    }
  }

  async deleteVectorByFileId(fileId: string): Promise<BaseResult<boolean>> {
    try {
      // 1. 获取向量信息
      const vectorResult = await this.getVectorsByFileId(fileId);
      if (!vectorResult.success || !vectorResult.data?.length) {
        return ResultUtil.error('未找到该文件的向量信息');
      }

      const vectors = vectorResult.data;

      // 按知识库ID分组
      const knowledgeVectors = vectors.reduce((acc, vector) => {
        if (!acc[vector.knowledgeId]) {
          acc[vector.knowledgeId] = [];
        }
        acc[vector.knowledgeId].push(vector);
        return acc;
      }, {} as Record<string, IKnowledgeVectorMeta[]>);

      // 2. 遍历每个知识库，删除向量
      for (const [knowledgeId, vectors] of Object.entries(knowledgeVectors)) {
        const ragManager = await this.getRagManager(knowledgeId);
        // 3. 批量删除向量
        await Promise.all(vectors.map((v) => ragManager.deleteLoader(v.loaderId)));
      }

      // 4. 从数据库中删除所有记录
      await this.dbManager.delete('knowledge_vector', {
        file_id: fileId,
      });

      return ResultUtil.success(true);
    } catch (error) {
      console.error('删除向量失败:', error);
      return ResultUtil.error(error);
    }
  }

  async delete(id: string): Promise<BaseResult<boolean>> {
    try {
      // 1. 获取知识库下的所有向量信息
      const vectorsResult = await this.getVectorsByKnowledgeId(id);
      if (!vectorsResult.success) {
        return ResultUtil.error('获取知识库向量信息失败');
      }

      if (vectorsResult.data?.length) {
        // 2. 获取RAG管理器
        const ragManager = await this.getRagManager(id);
        // 3. 删除所有向量
        await Promise.all(
          vectorsResult.data?.map((vector) => ragManager.deleteLoader(vector.loaderId)) || []
        );

        // 4. 删除向量记录
        await this.dbManager.delete('knowledge_vector', {
          knowledge_id: id,
        });
      }

      // 5. 删除知识库记录
      await this.dbManager.delete('knowledge', {
        id,
      });

      return ResultUtil.success(true);
    } catch (error) {
      console.error('删除知识库失败:', error);
      return ResultUtil.error(error);
    }
  }

  async deleteVector(params: IDeleteVectorParams): Promise<BaseResult<boolean>> {
    try {
      const { id, isDeleteFile } = params;

      // 1. 获取向量信息
      const sql = `
        SELECT kv.*
        FROM knowledge_vector kv
        WHERE kv.id = $1
      `;
      const result = await this.dbManager.query(sql, [id]);
      const vector = result?.rows?.[0];

      if (!vector) {
        return ResultUtil.error('未找到向量信息');
      }

      // 2. 获取RAG管理器
      const ragManager = await this.getRagManager(vector.knowledgeId);

      // 3. 删除向量数据
      await ragManager.deleteLoader(vector.loaderId);

      // 4. 从数据库中删除记录
      await this.dbManager.delete('knowledge_vector', {
        id,
      });

      // 5. 如果需要删除文件
      if (isDeleteFile && vector.fileId) {
        await this.fileManager.deleteFile({ fileId: vector.fileId });
      }

      return ResultUtil.success(true);
    } catch (error) {
      console.error('删除向量失败:', error);
      return ResultUtil.error(error);
    }
  }
}
