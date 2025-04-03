import { EModelType } from '@evo/types';

export const MODEL_TYPE_CONFIG = {
  [EModelType.vision]: {
    value: EModelType.vision,
    label: '图像',
    color: 'blue',
  },
  [EModelType.embedding]: {
    value: EModelType.embedding,
    label: '嵌入',
    color: 'green',
  },
  [EModelType.reasoning]: {
    value: EModelType.reasoning,
    label: '推理',
    color: 'orange',
  },
  [EModelType.audio]: {
    value: EModelType.audio,
    label: '语音',
    color: 'purple',
  },
  [EModelType.video]: {
    value: EModelType.video,
    label: '视频',
    color: 'magenta',
  },
} as const;

export const getModelTypeOptions = () => Object.values(MODEL_TYPE_CONFIG);