import { EModelType, IModel, IModelGroup } from "@evo/types";
import { providerLogo } from '../providerLogo';

export const alayanewModelGroup: IModelGroup[] = [
  {
    groupName: 'DeepSeek',
    models: [
      {
        id: 'deepseek-r1',
        name: 'DeepSeek R1',
        type: [],
      },
      {
        id: 'deepseek-v3',
        name: 'DeepSeek V3',
        type: [],
      },
    ],
  },
  {
    groupName: 'Qwen',
    models: [
      {
        id: 'qwen-72b',
        name: 'Qwen 72B',
        type: [],
      },
      {
        id: 'qwen-14b',
        name: 'Qwen 14B',
        type: [],
      },
    ],
  },
];

export const alayanewModelProvider: IModel = {
  id: 'alayanew',
  name: 'AlayaNew',
  logo: providerLogo.alayanew,
  provider: 'alayanew',
  apiInfo: {
    key: '',
    url: 'https://deepseek.alayanew.com',
  },
  webSite: {
    official: 'https://www.alayanew.com/backend/register',
    docs: 'https://docs.alayanew.com/docs/modelService/interview',
    models: 'https://www.alayanew.com/product/deepseek'
  },
  groups: alayanewModelGroup,
  enable: false,
};