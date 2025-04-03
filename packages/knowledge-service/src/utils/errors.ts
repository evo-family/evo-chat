export interface IErrorData {
  code: string;
  message: string;
}

export const ErrorCode = {
  KNOWLEDGE_NOT_FOUND: {
    code: 'KNOWLEDGE_NOT_FOUND',
    message: '知识库未找到',
  },
  MODEL_CONFIG_NOT_FOUND: {
    code: 'MODEL_CONFIG_NOT_FOUND',
    message: '未找到模型配置',
  },
  INVALID_MODEL_CONFIG: {
    code: 'INVALID_MODEL_CONFIG',
    message: '知识库模型配置无效',
  },
  FILE_VECTOR_FAILED: {
    code: 'FILE_VECTOR_FAILED',
    message: '文件向量化失败',
  },
  FILE_UPLOAD_FAILED: {
    code: 'FILE_UPLOAD_FAILED',
    message: '批量文件上传失败',
  },
  OPERATION_ERROR: {
    code: 'OPERATION_ERROR',
    message: '操作失败',
  },
} as const;

export class KnowledgeError extends Error {
  constructor(public error: IErrorData, public details?: Record<string, any>) {
    super(error.message);
    this.name = 'KnowledgeError';
  }
}
