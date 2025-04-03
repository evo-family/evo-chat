import { BaseLoader } from '@llm-tools/embedjs-interfaces';
import { JsonLoader, TextLoader, LocalPathLoader } from '@llm-tools/embedjs';
import { CsvLoader } from '@llm-tools/embedjs-loader-csv';
import { FileUtils } from '../../utils/fileUtils';

type LoaderCreator = (path: string) => Promise<BaseLoader>;

interface LoaderConfig {
  extensions: string[];
  create: LoaderCreator;
}

const loaderConfigs: LoaderConfig[] = [
  {
    extensions: ['.txt', '',],
    create: async (path: string) => {
      const content = FileUtils.readFileContent(path);
      return new TextLoader({ text: content });
    }
  },
  {
    extensions: ['.json'],
    create: async (path: string) => {
      const content = FileUtils.readFileContent(path);
      const embedContent = JSON.parse(content);
      return new JsonLoader({ object: embedContent });
    }
  },
  {
    extensions: ['.csv'],
    create: async (path: string) => {
      return new CsvLoader({ filePathOrUrl: path });
    }
  }
];

export const getLoader = (fileType: string): LoaderCreator => {
  const config = loaderConfigs.find(cfg => cfg.extensions.includes(fileType));
  return config?.create || (async (path: string) => new LocalPathLoader({ path }));
};
