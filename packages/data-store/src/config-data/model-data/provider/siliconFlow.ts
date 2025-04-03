import { EModelType, IModel, IModelGroup } from '@evo/types';
import { providerLogo } from '../providerLogo';

export const siliconFlowModelGroup: IModelGroup[] = [
  {
    groupName: 'deepseek-ai',
    models: [
      {
        id: 'deepseek-ai/DeepSeek-R1',
        name: 'deepseek-ai/DeepSeek-R1',
        type: [],
      },
      {
        id: 'deepseek-ai/DeepSeek-V3',
        name: 'deepseek-ai/DeepSeek-V3',
        type: [],
      },
    ],
  },
  {
    groupName: 'Qwen',
    models: [
      {
        id: 'Qwen/Qwen2.5-7B-Instruct',
        name: 'Qwen2.5-7B-Instruct',
        type: [],
      },
    ],
  },
  {
    groupName: 'silicon',
    models: [
      {
        id: 'meta-llama/Llama-3.3-70B-Instruct',
        name: 'meta-llama/Llama-3.3-70B-Instruct',
        type: [],
      },
      {
        id: 'BAAI/bge-m3',
        name: 'BAAI/bge-m3',
        type: [EModelType.embedding],
      },
    ],
  },
];

export const siliconFlowModelProvider: IModel = {
  id: '2',
  name: '硅基流动',
  logo: providerLogo.siliconFlow,
  provider: 'siliconflow',
  apiInfo: {
    key: '',
    url: 'https://api.siliconflow.cn',
  },
  webSite: {
    official: 'https://www.siliconflow.cn/',
    docs: 'https://docs.siliconflow.cn/',
    models: 'https://api.siliconflow.com/v1/models',
  },
  groups: siliconFlowModelGroup,
  enable: false,
};
