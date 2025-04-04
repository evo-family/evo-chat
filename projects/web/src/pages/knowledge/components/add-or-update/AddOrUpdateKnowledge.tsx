import React, { FC, memo, useEffect, useMemo } from 'react';
import { ModalForm, ProFormText, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import { EModelType, IKnowledgeMeta } from '@evo/types';
import { Button, message, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useKnowledgeSelector } from '../../knowledge-processor/KnowledgeProvider';
import { getAvailableModelsByModelType, useGlobalCtx, useModelSelector } from '@evo/data-store';

export interface IAddOrUpdateKnowledgeProps {}

export const AddOrUpdateKnowledge: FC<IAddOrUpdateKnowledgeProps> = memo(({}) => {
  const dialogData = useKnowledgeSelector((s) => s.addOrUploadDialog.dialogData);
  const openDialog = useKnowledgeSelector((s) => s.addOrUploadDialog.openDialog);
  const closeDialog = useKnowledgeSelector((s) => s.addOrUploadDialog.closeDialog);
  const [availableModels] = useGlobalCtx((ctx) => ctx.modelProcessor.availableModels);
  const [isElectron] = useGlobalCtx((s) => s.envProcessor?.isElectron);

  const createKnowledge = useKnowledgeSelector((s) => s.createKnowledge);
  // 找出所有embedding模型
  const modelOptions = useMemo(() => {
    const embeddingModels = getAvailableModelsByModelType(availableModels!, [EModelType.embedding]);
    return embeddingModels.map((item) => {
      return {
        label: item.name,
        title: item.name,
        options: item.models.map((model) => {
          return {
            label: model.name,
            value: model.id,
          };
        }),
      };
    });
  }, [availableModels]);

  const getProviderIdByModelId = (modelId: string) => {
    return availableModels?.find((f) => f.models.find((f) => f.id === modelId))?.id!;
  };

  const handleClick = () => {
    if (!isElectron) {
      message.info('知识库功能仅支持在桌面端使用');
      return;
    }
    openDialog();
  };

  return (
    <>
      <Tooltip title="添加知识库">
        <Button type="text" icon={<PlusOutlined />} onClick={handleClick} />
      </Tooltip>
      <ModalForm<IKnowledgeMeta>
        title="创建知识库"
        open={dialogData.open}
        width={600}
        modalProps={{
          destroyOnClose: true,
          onCancel: closeDialog,
        }}
        submitTimeout={2000}
        onFinish={async (values) => {
          try {
            // 创建数据
            if (dialogData.type === 'create') {
              const res = await createKnowledge({
                ...values,
                modelProviderId: getProviderIdByModelId(values.modelId)!,
              });
              console.log('evo=>', res);

              if (res.success) {
                message.success('创建成功');
              } else {
                message.error(res.error);
              }
            }

            closeDialog();
          } catch (error: any) {
            message.error(error?.message);
            return false;
          }
        }}
      >
        <ProFormText
          name="name"
          label="名称"
          placeholder="请输入名称"
          rules={[{ required: true, message: '请输入知识库名称' }]}
        />
        <ProFormTextArea name="description" label="描述" placeholder="请输入描述" />
        <ProFormSelect
          name="modelId"
          label="模型"
          placeholder="请选择模型"
          rules={[{ required: true, message: '请选择模型' }]}
          options={modelOptions}
        />
      </ModalForm>
    </>
  );
});
