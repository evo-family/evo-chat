import { IBaseMeta } from '../common';
import { IAvailableModel, IModelParams, IModelSchema } from '../model';

export interface IAssistantCategory {
  id: string;
  name: string;
}

export interface IAssistantMeta extends IBaseMeta {
  /**
   * 头像
   */
  avatar: string;
  /**
   * 标题
   */
  title: string;

  /**
   * 描述
   */
  description: string;

  /**
   * 助手标签
   */
  tags: string[];
  /**
   * 助手分类
   */
  category: IAssistantCategory['id'];

  /**
   * 助手提示词
   */
  prompt: string;

  /**
   * 默认模型
   */
  model?: {
    /**
     * 模型
     */
    availableModels: IAvailableModel[];
    /**
     * 模型参数
     */
    params: IModelParams;
  };

  /**
   * 是否为常用助手
   */
  isFrequent?: boolean;

  /**
   * 知识库信息
   */
  knowledgeIds?: Array<string>;

  /**
   * mcp信息
   */
  mcpIds: Array<string>;
}
