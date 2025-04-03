export type DialogOperationType = 'create' | 'update' | 'copy' | 'rename' | 'move';

export interface IDialogData<T extends any = any> {
  open: boolean;
  type: DialogOperationType;
  data?: T;
}

export interface IDeepSeekMsgStream {
  id: string;
  obejct: string;
  created: number;
  model: string;
  system_fingerprint: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content: string | null;
      reasoning_content: string | null;
    };
    logprobs: null;
    finish_reason: null | string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_tokens_details: {
      cached_tokens: number;
    };
    completion_tokens_details: {
      reasoning_tokens: number;
    };
    prompt_cache_hit_tokens: number;
    prompt_cache_miss_tokens: number;
  };
}
