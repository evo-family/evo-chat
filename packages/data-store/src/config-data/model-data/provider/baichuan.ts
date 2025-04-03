import { EModelType, IModel, IModelGroup } from "@evo/types";
import { providerLogo } from '../providerLogo';

export const baichuanModelGroup: IModelGroup[] = [
  {
    groupName: 'Baichuan4',
    models: [
      {
        id: 'Baichuan4',
        name: 'Baichuan4',
        type: [],
      },
    ],
  },
  {
    groupName: 'Baichuan3',
    models: [
      {
        id: 'Baichuan3-Turbo',
        name: 'Baichuan3 Turbo',
        type: [],
      },
      {
        id: 'Baichuan3-Turbo-128k',
        name: 'Baichuan3 Turbo 128k',
        type: [],
      },
    ],
  },
];

export const baichuanModelProvider: IModel = {
  id: 'baichuan',
  name: '百川智能',
  logo: providerLogo.baichuan,
  provider: 'baichuan',
  apiInfo: {
    key: '',
    url: 'https://api.baichuan-ai.com/v1',
  },
  webSite: {
    official: 'https://www.baichuan-ai.com/',
    docs: 'https://platform.baichuan-ai.com/docs',
    models: 'https://platform.baichuan-ai.com/price'
  },
  groups: baichuanModelGroup,
  enable: false,
};