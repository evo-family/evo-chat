import { EModelType, IModel, IModelGroup } from "@evo/types";
import { providerLogo } from '../providerLogo';

export const zhipuModelGroup: IModelGroup[] = [
  {
    groupName: 'GLM-Zero',
    models: [
      {
        id: 'glm-zero-preview',
        name: 'GLM-Zero-Preview',
        type: [],
      },
    ],
  },
  {
    groupName: 'GLM-4',
    models: [
      {
        id: 'glm-4-0520',
        name: 'GLM-4-0520',
        type: [],
      },
      {
        id: 'glm-4-long',
        name: 'GLM-4-Long',
        type: [],
      },
      {
        id: 'glm-4-plus',
        name: 'GLM-4-Plus',
        type: [],
      },
      {
        id: 'glm-4-air',
        name: 'GLM-4-Air',
        type: [],
      },
      {
        id: 'glm-4-airx',
        name: 'GLM-4-AirX',
        type: [],
      },
      {
        id: 'glm-4-flash',
        name: 'GLM-4-Flash',
        type: [],
      },
      {
        id: 'glm-4-flashx',
        name: 'GLM-4-FlashX',
        type: [],
      },
    ],
  },
  {
    groupName: 'GLM-4v',
    models: [
      {
        id: 'glm-4v',
        name: 'GLM 4V',
        type: [],
      },
      {
        id: 'glm-4v-plus',
        name: 'GLM-4V-Plus',
        type: [],
      },
    ],
  },
  {
    groupName: 'GLM-4-AllTools',
    models: [
      {
        id: 'glm-4-alltools',
        name: 'GLM-4-AllTools',
        type: [],
      },
    ],
  },
  {
    groupName: 'Embedding',
    models: [
      {
        id: 'embedding-3',
        name: 'Embedding-3',
        type: [EModelType.embedding],
      },
    ],
  },
];

export const zhipuModelProvider: IModel = {
  id: 'zhipu',
  name: '智谱 AI',
  logo: providerLogo.zhipu,
  provider: 'zhipu',
  apiInfo: {
    key: '',
    url: 'https://open.bigmodel.cn/api/paas/v4',
  },
  webSite: {
    official: 'https://open.bigmodel.cn/',
    docs: 'https://open.bigmodel.cn/dev/howuse/introduction',
    models: 'https://open.bigmodel.cn/modelcenter/square'
  },
  groups: zhipuModelGroup,
  enable: false,
};