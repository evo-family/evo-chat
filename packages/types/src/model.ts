export enum EModelType {
  /**
   * 推理
   */
  reasoning = 'reasoning',
  /**
   * 嵌入
   */
  embedding = 'embedding',

  /**
   * 视觉模型
   */
  vision = 'vision',

  /**
   * 语音
   */
  audio = 'audio',

  /**
   * 视频
   */
  video = 'video',
}

export type TModelType = keyof typeof EModelType;

export interface IModelApiInfo {
  /**
   * 接口地址
   */
  url: string;
  /**
   * 接口密钥
   */
  key: string;
}

export interface IModelWebSite {
  official: string,
  docs: string,
  models: string
}

export interface IModelGroup {
  sort?: number;
  groupName: string;
  models: IModelSchema[];
}
export interface IModelSchema {
  id: string;
  name: string;
  type?: EModelType[];
}


/**
 * 模型列表响应
 */
export interface IModelResponseItem {
  id: string;
  object: string;
  owned_by?: string;
  created?: number;
}

/**
 * 模型信息
 */
export interface IModel {
  /**
   * 编号
   */
  id: string;
  /**
   * 名称
   */
  name: string;

  /**
   * 提供商logo
   */
  logo?: string;

  /**
   * 提供商
   */
  provider: string;

  /**
   * api info
   */
  apiInfo: IModelApiInfo;
  webSite?: IModelWebSite;
  groups: IModelGroup[];
  enable: boolean;
}

/**
 * 可用的模型信息，不需要分组的
 */
export interface IAvailableModel extends Omit<IModel, 'groups' | 'enable'> {
  models: IModelSchema[];
}

export type TAvailableModelMap = Record<string, IAvailableModel>;

/**
 * 模型参数
 */
export interface IModelParams {

  /**
 * 上下文数量限制
 * 取值范围：1-10，默认值：1
 */
  context_count?: number;
  /**
   * 控制生成文本中的随机性，值越高表示更具创意但可能不太可控
   * 取值范围：0-2，默认值：1
   */
  temperature?: number;

  /**
   * 控制生成文本的多样性，值越高表示更多样
   * 取值范围：0-1，默认值：1
   */
  top_p?: number;

  /**
 * 控制模型使用不常见词的倾向
 * 取值范围：-2.0-2.0，默认值：0
 */
  frequency_penalty?: number;
  /**
   * 控制模型避免重复已经出现过的内容的程度
   * 取值范围：-2.0-2.0，默认值：0
   */
  presence_penalty?: number;



  /**
 * 控制生成文本的长度
 * 取值范围：0-4096，默认值：2048
 * 暂时不设置
 */
  max_tokens?: number;
}

export interface IBaseModelMessage {
  id: string;
  createdTime: number;
  model: string;
  content: string;
}

export interface IDeepSeekMessage extends IBaseModelMessage {
  reasoning_content: string;
}


/**
 * 调用模型需要的参数
 */
export interface IModelConfig extends IModelApiInfo {
  modelId: string;
}
