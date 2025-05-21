import { EModelType } from '@evo/types';

// 视觉模型
const visionAllowedModels = [
  'llava',
  'moondream',
  'minicpm',
  'gemini-1\\.5',
  'gemini-2\\.0',
  'gemini-exp',
  'claude-3',
  'vision',
  'glm-4v',
  'qwen-vl',
  'qwen2-vl',
  'qwen2.5-vl',
  'qvq',
  'internvl2',
  'grok-vision-beta',
  'pixtral',
  'gpt-4(?:-[\\w-]+)',
  'gpt-4o(?:-[\\w-]+)?',
  'chatgpt-4o(?:-[\\w-]+)?',
  'o1(?:-[\\w-]+)?',
  'deepseek-vl(?:[\\w-]+)?',
  'kimi-latest',
  'gemma-3(?:-[\\w-]+)',
];

const visionExcludedModels = [
  'gpt-4-\\d+-preview',
  'gpt-4-turbo-preview',
  'gpt-4-32k',
  'gpt-4-\\d+',
];

// 视觉模型
export const VISION_REGEX = new RegExp(
  `\\b(?!(?:${visionExcludedModels.join('|')})\\b)(${visionAllowedModels.join('|')})\\b`,
  'i'
);

// 嵌入模型
export const EMBEDDING_REGEX =
  /(?:^text-|embed|bge-|e5-|LLM2Vec|retrieval|uae-|gte-|jina-clip|jina-embeddings)/i;

// 推理模型
export const REASONING_REGEX =
  /^(o\d+(?:-[\w-]+)?|.*\b(?:reasoner|thinking)\b.*|.*-[rR]\d+.*|.*\bqwq(?:-[\w-]+)?\b.*)$/i;

// 重排序 models
export const RERANKING_REGEX = /(?:rerank|re-rank|re-ranker|re-ranking|retrieval|retriever)/i;

/**
 * 获取模型支持的能力类型
 * @param modelName 模型名称
 * @returns 模型支持的能力类型数组
 */
export const getModelTypesById = (modelName: string, type?: EModelType[]): EModelType[] => {
  const types: EModelType[] = [];

  if (Array.isArray(type)) {
    types.push(...type);
  }
  // 检查视觉能力
  if (VISION_REGEX.test(modelName)) {
    types.push(EModelType.vision);
  }

  // 检查嵌入能力
  if (EMBEDDING_REGEX.test(modelName)) {
    types.push(EModelType.embedding);
  }

  // 检查推理能力
  if (REASONING_REGEX.test(modelName)) {
    types.push(EModelType.reasoning);
  }

  return Array.from(new Set(types));
};
