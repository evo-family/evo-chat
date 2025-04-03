import { EModelType, IModel, IModelGroup } from "@evo/types";
import { providerLogo } from '../providerLogo';

export const baiduQianfanModelGroup: IModelGroup[] = [
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
    groupName: 'ERNIE',
    models: [
      {
        id: 'ernie-4.0-8k-latest',
        name: 'ERNIE-4.0',
        type: [],
      },
      {
        id: 'ernie-4.0-turbo-8k-latest',
        name: 'ERNIE 4.0 Trubo',
        type: [],
      },
      {
        id: 'ernie-speed-8k',
        name: 'ERNIE Speed',
        type: [],
      },
      {
        id: 'ernie-lite-8k',
        name: 'ERNIE Lite',
        type: [],
      },
    ],
  },
  {
    groupName: 'Embedding',
    models: [
      {
        id: 'bge-large-zh',
        name: 'BGE Large ZH',
        type: [EModelType.embedding],
      },
      {
        id: 'bge-large-en',
        name: 'BGE Large EN',
        type: [EModelType.embedding],
      },
    ],
  },
];

export const baiduQianfanModelProvider: IModel = {
  id: 'baidu-cloud',
  name: '百度千帆',
  logo: providerLogo.baiduQianfan,
  provider: 'baiduqianfan',
  apiInfo: {
    key: '',
    url: 'https://qianfan.baidubce.com/v2/',
  },
  webSite: {
    official: 'https://cloud.baidu.com/',
    docs: 'https://cloud.baidu.com/doc/index.html',
    models: 'https://cloud.baidu.com/doc/WENXINWORKSHOP/s/Fm2vrveyu'
  },
  groups: baiduQianfanModelGroup,
  enable: false,
};