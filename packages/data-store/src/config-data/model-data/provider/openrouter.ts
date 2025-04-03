import { EModelType, IModel, IModelGroup } from "@evo/types";
import { providerLogo } from '../providerLogo';

export const openrouterModelGroup: IModelGroup[] = [
  {
    groupName: 'Gemma',
    models: [
      {
        id: 'google/gemma-2-9b-it:free',
        name: 'Google: Gemma 2 9B',
        type: [],
      },
    ],
  },
  {
    groupName: 'Phi',
    models: [
      {
        id: 'microsoft/phi-3-mini-128k-instruct:free',
        name: 'Phi-3 Mini 128K Instruct',
        type: [],
      },
      {
        id: 'microsoft/phi-3-medium-128k-instruct:free',
        name: 'Phi-3 Medium 128K Instruct',
        type: [],
      },
    ],
  },
  {
    groupName: 'Llama3',
    models: [
      {
        id: 'meta-llama/llama-3-8b-instruct:free',
        name: 'Meta: Llama 3 8B Instruct',
        type: [],
      },
    ],
  },
  {
    groupName: 'Mistral',
    models: [
      {
        id: 'mistralai/mistral-7b-instruct:free',
        name: 'Mistral: Mistral 7B Instruct',
        type: [],
      },
    ],
  },
];

export const openrouterModelProvider: IModel = {
  id: 'openrouter',
  name: 'OpenRouter',
  logo: providerLogo.openrouter,
  provider: 'openrouter',
  apiInfo: {
    key: '',
    url: 'https://openrouter.ai/api/v1/',
  },
  webSite: {
    official: 'https://openrouter.ai/',
    docs: 'https://openrouter.ai/docs/quick-start',
    models: 'https://openrouter.ai/docs/models'
  },
  groups: openrouterModelGroup,
  enable: false,
};