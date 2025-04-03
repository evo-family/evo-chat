import {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionCreateParamsBase,
  ChatCompletionMessageParam,
} from 'openai/resources/chat/completions';

import OpenAI from 'openai';
import { Stream } from 'openai/streaming';

export interface ChatOptions extends Omit<ChatCompletionCreateParamsBase, 'model' | 'messages'> {
  model?: string; // 模型名称
}

export interface OpenAiClientOptions {
  apiKey: string;
  baseURL?: string;
  defaultModel?: string;
  dangerouslyAllowBrowser?: boolean; // 添加浏览器支持选项
}

export type ChatResponse<T extends boolean> = T extends true
  ? Stream<ChatCompletionChunk>
  : { role: string; content: string | null };

export class OpenAiClient {
  private client: OpenAI;
  private defaultModel: string;

  constructor(options: OpenAiClientOptions) {
    const {
      apiKey,
      baseURL,
      defaultModel = 'gpt-3.5-turbo',
      dangerouslyAllowBrowser = true,
    } = options;

    this.client = new OpenAI({
      apiKey,
      baseURL: baseURL || 'https://api.openai.com/v1',
      dangerouslyAllowBrowser, // 启用浏览器支持
    });
    this.defaultModel = defaultModel;
  }

  /**
   * 发送聊天请求
   * @param messages 消息列表
   * @param options 聊天选项
   * @returns 如果是流式输出返回 Stream，否则返回单条消息
   */

  async chat<T extends boolean = false>(
    messages: ChatCompletionMessageParam[],
    options: ChatOptions & { stream?: T } = {}
  ): Promise<ChatResponse<T>> {
    const {
      model = this.defaultModel,
      stream = false as T,
      temperature = 0.7,
      top_p = 1,
      presence_penalty = 0,
      frequency_penalty = 0,
      ...restOptions
    } = options;

    const params = {
      messages,
      model,
      temperature,
      top_p,
      presence_penalty,
      frequency_penalty,
      stream,
      ...restOptions,
    };

    try {
      if (stream) {
        const stream = await this.client.chat.completions.create(params);
        return stream as ChatResponse<T>;
      } else {
        const completion = await this.client.chat.completions.create({
          ...params,
          stream: false,
        });

        return {
          role: completion.choices[0].message.role,
          content: completion.choices[0].message.content,
        } as ChatResponse<T>;
      }
    } catch (error) {
      console.error('OpenAI API 调用失败:', error);
      throw error;
    }
  }

  /**
   * 测试 API 连接是否正常
   * @returns 连接成功返回 true，失败返回 false
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.chat([{ role: 'user', content: 'Hi' }], {
        stream: false,
        max_tokens: 5,
        temperature: 0.1,
      });
      return true;
    } catch (error) {
      console.error('连接测试失败:', error);
      return false;
    }
  }
}
