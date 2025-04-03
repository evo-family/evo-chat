import { EModelType, IModel, IModelGroup } from "@evo/types";
import { providerLogo } from '../providerLogo';


export const infiniModelGroup: IModelGroup[] = [
  {
    groupName: 'DeepSeek',
    models: [
      {
        id: 'deepseek-r1',
        name: 'deepseek-r1',
        type: [],
      },
      {
        id: 'deepseek-r1-distill-qwen-32b',
        name: 'deepseek-r1-distill-qwen-32b',
        type: [],
      },
      {
        id: 'deepseek-v3',
        name: 'deepseek-v3',
        type: [],
      },
    ],
  },
  {
    groupName: 'Qwen',
    models: [
      {
        id: 'qwen2.5-72b-instruct',
        name: 'qwen2.5-72b-instruct',
        type: [],
      },
      {
        id: 'qwen2.5-32b-instruct',
        name: 'qwen2.5-32b-instruct',
        type: [],
      },
      {
        id: 'qwen2.5-14b-instruct',
        name: 'qwen2.5-14b-instruct',
        type: [],
      },
      {
        id: 'qwen2.5-7b-instruct',
        name: 'qwen2.5-7b-instruct',
        type: [],
      },
      {
        id: 'qwen2-72b-instruct',
        name: 'qwen2-72b-instruct',
        type: [],
      },
      {
        id: 'qwq-32b-preview',
        name: 'qwq-32b-preview',
        type: [],
      },
      {
        id: 'qwen2.5-coder-32b-instruct',
        name: 'qwen2.5-coder-32b-instruct',
        type: [],
      },
    ],
  },
  {
    groupName: 'Llama',
    models: [
      {
        id: 'llama-3.3-70b-instruct',
        name: 'llama-3.3-70b-instruct',
        type: [],
      },
    ],
  },
  {
    groupName: 'BAAI',
    models: [
      {
        id: 'bge-m3',
        name: 'bge-m3',
        type: [EModelType.embedding],
      },
    ],
  },
  {
    groupName: 'Gemma',
    models: [
      {
        id: 'gemma-2-27b-it',
        name: 'gemma-2-27b-it',
        type: [],
      },
    ],
  },
  {
    groupName: 'Jina',
    models: [
      {
        id: 'jina-embeddings-v2-base-zh',
        name: 'jina-embeddings-v2-base-zh',
        type: [EModelType.embedding],
      },
      {
        id: 'jina-embeddings-v2-base-code',
        name: 'jina-embeddings-v2-base-code',
        type: [EModelType.embedding],
      },
    ],
  },
];

export const infiniModelProvider: IModel = {
  id: 'infini',
  name: '无问苍穹',
  logo: providerLogo.infini,
  provider: 'infini',
  apiInfo: {
    key: '',
    url: 'https://cloud.infini-ai.com/maas',
  },
  webSite: {
    official: 'https://cloud.infini-ai.com/',
    docs: 'https://docs.infini-ai.com/gen-studio/api/maas.html#/operations/chatCompletions',
    models: 'https://cloud.infini-ai.com/genstudio/model'
  },
  groups: infiniModelGroup,
  enable: false,
};