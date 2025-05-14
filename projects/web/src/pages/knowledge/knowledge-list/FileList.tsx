import React, { FC, useEffect, useRef } from 'react';
import { message, Modal, Progress } from 'antd';
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { IFileMeta, IKnowledgeVectorMetaVo } from '@evo/types';
import dayjs from 'dayjs';
import { formatFileSize } from '@evo/utils';
import { useKnowledgeSelector } from '../knowledge-processor/KnowledgeProvider';
import { KnowledgeBridgeFactory } from '@evo/platform-bridge';

interface FileItem extends IFileMeta {
  vectorProgress: number;
}

export const KnowledgeFileList: FC = () => {
  const getVectorsByKnowledgeId = useKnowledgeSelector((s) => s.getVectorsByKnowledgeId);
  const vectorsByKnowledgeIdResult = useKnowledgeSelector((s) => s.vectorsByKnowledgeIdResult);
  const selectKnowledge = useKnowledgeSelector((s) => s.selectKnowledge);
  const tableActionRef = useKnowledgeSelector((s) => s.tableActionRef);
  const deleteVector = useKnowledgeSelector((s) => s.deleteVector);
  useEffect(() => {
    if (!selectKnowledge?.id) {
      return;
    }
    getVectorsByKnowledgeId(selectKnowledge.id);
  }, [selectKnowledge?.id]);

  const columns: ProColumns<IKnowledgeVectorMetaVo>[] = [
    {
      title: '文件名',
      dataIndex: 'fileName',
      ellipsis: true,
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'fileType',
      width: 100,
    },
    {
      title: '大小',
      dataIndex: 'fileSize',
      width: 120,
      render: (_, record) => formatFileSize(record.fileSize),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
      render: (_, record) =>
        record.createTime ? dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 40,
      render: (_, record) => [
        <a
          key="delete"
          onClick={() => {
            Modal.confirm({
              title: '删除确认',
              content: '确定要删除该向量数据吗？',
              okText: '确认删除',
              cancelText: '取消',
              okType: 'danger',
              onOk: async () => {
                try {
                  await deleteVector(record.id);
                  message.success('删除成功');
                  tableActionRef.current?.reload();
                } catch (error) {
                  message.error('删除失败');
                }
              },
            });
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  return (
    <ProTable<IKnowledgeVectorMetaVo>
      columns={columns}
      actionRef={tableActionRef}
      dataSource={vectorsByKnowledgeIdResult?.data || []}
      rowKey="id"
      pagination={{
        showQuickJumper: true,
        showSizeChanger: true,
      }}
      search={false}
      dateFormatter="string"
      headerTitle="知识库文件"
      toolBarRender={false}
    />
  );
};
