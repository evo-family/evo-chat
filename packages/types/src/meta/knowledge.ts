import { IBaseMeta, OmitBaseMeta } from '../common';
import { IFileMeta } from './file';

export interface IKnowledgeMeta extends IBaseMeta {
  /**
   * 名称
   */
  name: string;

  /**
   * 描述
   */
  description: string;

  /**
   * 模型id
   */
  modelId: string;

  /**
   * 模型提供商id
   */
  modelProviderId: string;
}

/**
 * 知识库向量信息
 */
export interface IKnowledgeVectorMeta extends IBaseMeta {
  /**
   * 文件编号
   */
  fileId: string;
  /**
   * 文件向量后的loader id，也可以说是文件向量后的id
   */
  loaderId: string;
  loaderType: string;
  /**
   * 知识库id
   */
  knowledgeId: string;
}

/**
 * 知识库向量信息vo
 */
export interface IKnowledgeVectorMetaVo extends IKnowledgeVectorMeta {
  fileId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
}
