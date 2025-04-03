import { IFileMeta } from '@evo/types';
import { RAGApplication, TextLoader } from '@llm-tools/embedjs';
import { FileUtils } from '../../utils/fileUtils';
import { getLoader } from './loaderFactory';

export const addDocumentLoader = async (ragApp: RAGApplication, fileMeta: IFileMeta) => {
  try {
    const createLoader = getLoader(fileMeta.type);
    const loader = await createLoader(fileMeta.path);
    return await ragApp.addLoader(loader);
  } catch (error) {
    try {
      const content = FileUtils.readFileContent(fileMeta.path);
      return await ragApp.addLoader(new TextLoader({ text: content }));
    } catch (error) {
      throw Error(`Failed to add loader for file ${fileMeta.path}`);
    }
  }
};


