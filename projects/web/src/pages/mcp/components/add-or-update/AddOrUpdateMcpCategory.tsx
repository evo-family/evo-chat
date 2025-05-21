import React, { FC, memo } from 'react';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { IMcpCategoryMeta } from '@evo/types';
import { Button, message, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMcpSelector } from '../../mcp-processor/McpProvider';
import { useGlobalCtx } from '@evo/data-store';

export interface IAddOrUpdateMcpCategoryProps {}

export const AddOrUpdateMcpCategory: FC<IAddOrUpdateMcpCategoryProps> = memo(() => {
  const dialogData = useMcpSelector((s) => s.addOrUpdateCategoryDialog.dialogData);
  const setCreateModalData = useMcpSelector((s) => s.addOrUpdateCategoryDialog.setCreateModalData);
  const closeDialog = useMcpSelector((s) => s.addOrUpdateCategoryDialog.closeDialog);
  const [isElectron] = useGlobalCtx((s) => s.envProcessor?.isElectron);
  const createCategory = useMcpSelector((s) => s.createCategory);
  const updateCategory = useMcpSelector((s) => s.updateCategory);

  const handleClick = () => {
    setCreateModalData();
  };

  return (
    <>
      <Tooltip title="添加分类">
        <Button type="text" icon={<PlusOutlined />} onClick={handleClick} />
      </Tooltip>
      <ModalForm<IMcpCategoryMeta>
        title={dialogData.type === 'create' ? '创建分类' : '编辑分类'}
        open={dialogData.open}
        width={600}
        modalProps={{
          destroyOnClose: true,
          onCancel: closeDialog,
        }}
        initialValues={dialogData.data}
        submitTimeout={2000}
        onFinish={async (values) => {
          try {
            let res;
            if (dialogData.type === 'create') {
              res = await createCategory(values);
            } else {
              res = await updateCategory({
                ...dialogData.data,
                ...values,
              });
            }
            if (res.success) {
              message.success(dialogData.type === 'create' ? '创建成功' : '更新成功');
              closeDialog();
              return true;
            } else {
              message.error(res.error);
              return false;
            }
          } catch (error: any) {
            message.error(error?.message);
            return false;
          }
        }}
      >
        <ProFormText
          name="name"
          label="名称"
          placeholder="请输入分类名称"
          rules={[{ required: true, message: '请输入分类名称' }]}
        />
        <ProFormTextArea name="description" label="描述" placeholder="请输入分类描述" />
      </ModalForm>
    </>
  );
});
