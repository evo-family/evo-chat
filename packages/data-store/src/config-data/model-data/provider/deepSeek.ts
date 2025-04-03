/**
 * deep seek
 */

import { IModel } from '@evo/types';
import { providerLogo } from '../providerLogo';

export const deepSeekModelGroup = [
  {
    groupName: 'DeepSeek Chat',
    models: [
      {
        id: 'deepseek-chat',
        type: [],
        name: 'DeepSeek Chat',
      },
    ],
  },
  {
    groupName: 'DeepSeek Reasoner',
    models: [
      {
        id: 'deepseek-reasoner',
        type: [],
        name: 'DeepSeek Reasoner',
      },
    ],
  },
];

export const deepSeekModelProvider: IModel = {
  id: 'deepseek',
  name: '深度求索',
  logo: providerLogo.deepseek,
  provider: 'deepseek',
  apiInfo: {
    key: '',
    url: 'https://api.deepseek.com',
  },
  webSite: {
    official: 'https://deepseek.com/',
    docs: 'https://platform.deepseek.com/api-docs/',
    models: 'https://api.deepseek.com/v1/models',
  },
  groups: deepSeekModelGroup,
  enable: true,
};
