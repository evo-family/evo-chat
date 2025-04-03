import { RAGApplication, RAGApplicationBuilder } from '@llm-tools/embedjs';
import { OpenAiEmbeddings } from '@llm-tools/embedjs-openai';
import { LibSqlDb } from '@llm-tools/embedjs-libsql';
import { IModelConfig, IFileMeta } from '@evo/types';
import { addDocumentLoader } from './loader/loader';
import { AddLoaderReturn } from '@llm-tools/embedjs-interfaces';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fs from 'fs';
import path from 'path';


export class RAGAppManager {
  private static instances: Map<string, RAGAppManager> = new Map();
  // private ragApplication: RAGApplication | null = null;
  private embeddingConfig: IModelConfig | null = null;
  private vectorDBPath: string;
  private constructor(vectorDBPath: string) {
    this.vectorDBPath = vectorDBPath;
    const dbDir = path.dirname(vectorDBPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

  }

  public static getInstance(vectorDBPath: string): RAGAppManager {

    if (!this.instances.has(vectorDBPath)) {
      this.instances.set(vectorDBPath, new RAGAppManager(vectorDBPath));
    }
    return this.instances.get(vectorDBPath)!;
  }

  public setEmbeddingConfig(config: IModelConfig): this {
    this.embeddingConfig = config;
    // this.build();
    return this;
  }

  // 移除 setVectorDBPath 方法，因为现在在构造函数中设置

  public async build(): Promise<RAGApplication> {
    if (!this.embeddingConfig || !this.vectorDBPath) {
      throw new Error('Embedding config and vector DB path must be set before building');
    }

    const { key, url, modelId } = this.embeddingConfig;
    console.log('generator-ragApplication-params', {
      modelName: modelId,
      apiKey: key,
      configuration: { baseURL: url },
      dimensions: 1536,
      batchSize: 10,
    });
    return new RAGApplicationBuilder()
      .setModel('NO_MODEL')
      .setEmbeddingModel(new OpenAiEmbeddings({
        model: modelId,
        apiKey: key,
        configuration: {
          baseURL: url,
          // httpAgent: new HttpsProxyAgent('http://127.0.0.1:7890/')
        },
        dimensions: 1536,
        batchSize: 10,
      }))
      .setVectorDatabase(new LibSqlDb({
        path: this.vectorDBPath,
      }))
      .build();
  }

  public async getRagApplication() {
    return await this.build();
  }

  public async addLoader(fileMeta: IFileMeta): Promise<AddLoaderReturn> {
    const ragApplication = await this.getRagApplication();
    return await addDocumentLoader(ragApplication, fileMeta)!
  }

  public async deleteLoader(loaderId: string): Promise<void> {
    const ragApplication = await this.getRagApplication();
    await ragApplication.deleteLoader(loaderId);
  }

  public async search(query: string) {
    const ragApplication = await this.getRagApplication();
    return await ragApplication.search(query);
  }

  public async reset(): Promise<void> {
    const ragApplication = await this.getRagApplication();
    if (ragApplication) {
      await ragApplication.reset();
      // 从实例映射中移除
      RAGAppManager.instances.delete(this.vectorDBPath);
    }
  }
}
