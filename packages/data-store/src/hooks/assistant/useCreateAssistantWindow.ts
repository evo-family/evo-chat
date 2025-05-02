import { useNavigate } from 'react-router';
import { useMemoizedFn } from 'ahooks';
import { IAssistantMeta } from '@evo/types';
import { useGlobalCtx } from '../../react-context/global';
import { useSettingSelector } from '../../processor';

export const useCreateAssistantWindow = () => {
  const [chatCtrl] = useGlobalCtx((ctx) => ctx.chatCtrl);
  const defaultMessageModel = useSettingSelector((s) => s.defaultMessageModel);
  const navigate = useNavigate();

  const createAssistantWindow = useMemoizedFn(async (assistant: IAssistantMeta) => {
    // 导航到聊天页面
    navigate('/home');

    // 创建新的会话窗口
    const newWinIns = await chatCtrl.createWindow({
      agentIds: [assistant.id],
      knowledgeIds: assistant?.knowledgeIds || [],
      models: assistant?.model?.availableModels || [defaultMessageModel],
      mcpIds: assistant.mcpIds,
      manualTitle: assistant.title,
    });

    return newWinIns;
  });

  return {
    createAssistantWindow,
  };
};
