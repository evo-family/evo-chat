import { IMessageConfig, TComposedContexts } from '@/chat-message/types';

import { ChatCompletionContentPart } from 'openai/resources/index.mjs';
import { IFileMeta } from '@evo/types';
import { UploadBridgeFactory } from '@evo/platform-bridge';
import { isImageFile } from '@evo/utils';

export const composeAttachment = async (params: { fileInfos?: IFileMeta[] }) => {
  const { fileInfos } = params;
  const results: TComposedContexts = [];

  if (!fileInfos) return results;

  const fileContents: ChatCompletionContentPart[] = [];

  await Promise.all(
    fileInfos.map(async (info) => {
      try {
        const result = await UploadBridgeFactory.getUpload().getFileContent(info.id);

        if (!result?.data) return;

        isImageFile(info.name)
          ? fileContents.push({
              image_url: { url: result.data, detail: 'auto' },
              type: 'image_url',
            })
          : fileContents.push({
              text: result.data,
              type: 'text',
            });
      } catch (error) {
        console.error(error);
      }
    })
  );

  if (fileContents.length) {
    results.push({
      role: 'user',
      content: fileContents,
    });
  }

  return results;
};
