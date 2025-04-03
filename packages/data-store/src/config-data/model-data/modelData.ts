import { IModel, IModelParams } from '@evo/types';

import { alayanewModelProvider } from './provider/alayanew';
import { baichuanModelProvider } from './provider/baichuan';
import { baiduQianfanModelProvider } from './provider/baiduQianfan';
import { deepSeekModelProvider } from './provider/deepSeek';
import { getModelTypesById } from '@evo/utils';
import { infiniModelProvider } from './provider/infini';
import { ollamaModelProvider } from './provider/ollama';
import { openaiModelProvider } from './provider/openai';
import { openrouterModelProvider } from './provider/openrouter';
import { siliconFlowModelProvider } from './provider/siliconFlow';
import { v4 as uuidv4 } from 'uuid';
import { zhipuModelProvider } from './provider/zhipu';

export const defaultModels: IModel[] = [
  deepSeekModelProvider,
  siliconFlowModelProvider,
  baiduQianfanModelProvider,
  alayanewModelProvider,
  openrouterModelProvider,
  ollamaModelProvider,
  infiniModelProvider,
  openaiModelProvider,
  baichuanModelProvider,
  zhipuModelProvider,
].map((model) => ({
  ...model,
  groups: model.groups.map((group) => ({
    ...group,
    models: group.models.map((modelSchema) => ({
      ...modelSchema,
      type: getModelTypesById(modelSchema.id),
    })),
  })),
}));

export const defaultModelsMap: Record<string, IModel> = defaultModels.reduce(
  (acc, model) => ({
    ...acc,
    [model.id]: model,
  }),
  {}
);

export const defaultModelParamsConfig = [
  {
    key: 'context_count',
    name: '上下文数量限制',
    tips: '要保留在上下文中的消息数量，数值越大，上下文越长，消耗的 token 越多。普通聊天建议 5-10',
    min: 0,
    max: 10,
    step: 1,
    value: 3,
  },
  {
    key: 'temperature',
    name: '创意活跃度',
    tips: '数值越大，回答越有创意和想象力；数值越小，回答越严谨',
    min: 0,
    max: 2,
    step: 0.1,
    value: 0.7,
  },
  {
    key: 'top_p',
    name: '思维开放度',
    tips: '考虑多少种可能性，值越大，接受更多可能的回答；值越小，倾向选择最可能的回答。不推荐和创意活跃度一起更改',
    min: 0.1,
    max: 1,
    step: 0.1,
    value: 1,
  },
  {
    key: 'frequency_penalty',
    name: '表述发散度',
    tips: '值越大，越倾向不同的表达方式，避免概念重复；值越小，越倾向使用重复的概念或叙述，表达更具一致性',
    min: -2,
    max: 2,
    step: 0.1,
    value: 0,
  },
  {
    key: 'presence_penalty',
    name: '词汇丰富度',
    tips: '值越大，用词越丰富多样；值越低，用词更朴实简单',
    min: -2,
    max: 2,
    step: 0.1,
    value: 0,
  },
];

export const defaultModelParams: IModelParams = {
  // 上下文数量限制 (取值范围：1-10)
  context_count: 5,
  // 创意活跃度 (取值范围：0-2，默认值：1)
  temperature: 0.7,

  // 思维开放度
  top_p: 1,

  frequency_penalty: 0,
  presence_penalty: 0,

  // maxTokens: 2048,
};

/**
 * 生成默认的model
 * @param model
 * @returns
 */
export const generateDefaultModel = (model: Partial<IModel> = {}): IModel => {
  const resultModel: IModel = {
    id: uuidv4(),
    name: '',
    logo: '',
    provider: '',
    groups: [],
    enable: true,
    apiInfo: {
      url: '',
      key: '',
    },
    ...model,
  };
  return resultModel;
};
