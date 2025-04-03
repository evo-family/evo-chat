export interface IAssistantMeta {
  /**
   * 助手标题
   */
  title: string;
  /**
   * 助手头像
   */
  avatar: string;
  /**
   * 助手描述
   */
  description: string;
  /**
   * 助手标签
   */
  tags: string[];
  /**
   * 助手分类
   */
  category: string;
}

export interface IAssistant {
  author: string;
  /**
   * 助手唯一标识
   */
  identifier: string;
  /**
   * 助手元数据
   */
  meta: IAssistantMeta;
  /**
   * 助手提示词
   */
  prompt: string;
  /**
   * 助手配置
   */
  config: {
    systemRole: string;
    enableHistoryCount: string;
    historyCount: string;
  };
  createdAt?: string;
}
