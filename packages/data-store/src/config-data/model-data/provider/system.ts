import { EModelType, IModel, IModelGroup } from '@evo/types';
import { providerLogo } from '../providerLogo';

export const systemModelGroup: IModelGroup[] = [
  {
    groupName: 'Qwen',
    models: [
      {
        id: 'Qwen/Qwen3-8B',
        name: 'Qwen/Qwen3-8B',
        type: [EModelType.reasoning],
      },
    ],
  },
  {
    groupName: 'BAAI',
    models: [
      {
        id: 'BAAI/bge-m3',
        name: 'BAAI/bge-m3',
        type: [EModelType.embedding],
      },
    ],
  },
];

export const systemModelProvider: IModel = {
  id: 'system',
  name: '系统预置',
  logo: providerLogo.system,
  provider: 'evo-chat',
  apiInfo: {
    key: 'sk-clzvegexztpylvocpbxzmhriagrteeamicuexlqszbbebijm',
    url: 'https://api.siliconflow.cn',
  },
  webSite: {
    official: '',
    docs: '',
    models: '',
  },
  groups: systemModelGroup,
  enable: true,
};
