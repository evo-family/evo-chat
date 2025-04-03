import { EModelType, IModel, IModelGroup } from "@evo/types";
import { providerLogo } from '../providerLogo';
export const ollamaModelGroup: IModelGroup[] = [
  {
    groupName: 'Ollama',
    models: [],
  },
];

export const ollamaModelProvider: IModel = {
  id: 'ollama',
  name: 'Ollama',
  logo: providerLogo.ollama,
  provider: 'ollama',
  apiInfo: {
    key: '',
    url: 'http://localhost:11434',
  },
  webSite: {
    official: 'https://ollama.com/',
    docs: 'https://github.com/ollama/ollama/tree/main/docs',
    models: 'https://ollama.com/library'
  },
  groups: ollamaModelGroup,
  enable: false,
};
