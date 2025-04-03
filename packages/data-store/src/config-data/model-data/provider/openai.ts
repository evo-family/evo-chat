import { EModelType, IModel, IModelGroup } from "@evo/types";
import { modelLogo } from "../modelLogo";
import { providerLogo } from '../providerLogo';
export const openaiModelGroup: IModelGroup[] = [
  {
    groupName: 'gpt-4.5',
    models: [
      {
        id: 'gpt-4.5-preview',
        name: 'gpt-4.5-preview',
        type: [],
      },
    ],
  },
  {
    groupName: 'GPT 4o',
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        type: [],
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o-mini',
        type: [],
      },
    ],
  },
  {
    groupName: 'o1',
    models: [
      {
        id: 'o1-mini',
        name: 'o1-mini',
        type: [],
      },
      {
        id: 'o1-preview',
        name: 'o1-preview',
        type: [],
      },
    ],
  },
];

export const openaiModelProvider: IModel = {
  id: 'openai',
  name: 'OpenAI',
  logo: providerLogo.openai,
  provider: 'openai',
  apiInfo: {
    key: '',
    url: 'https://api.openai.com',
  },
  webSite: {
    official: 'https://openai.com/',
    docs: 'https://platform.openai.com/docs',
    models: 'https://platform.openai.com/docs/models'
  },
  groups: openaiModelGroup,
  enable: false,
};