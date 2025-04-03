import React, { FC, useEffect } from 'react';
import { Progress } from 'antd';
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { IFileMeta, IKnowledgeVectorMetaVo } from '@evo/types';
import dayjs from 'dayjs';
import { formatFileSize } from '@evo/utils';
import { useKnowledgeSelector } from '../knowledge-processor/KnowledgeProvider';

interface FileItem extends IFileMeta {
  vectorProgress: number;
}

export const KnowledgeFileList: FC = () => {

  const getVectorsByKnowledgeId = useKnowledgeSelector(s => s.getVectorsByKnowledgeId);
  const vectorsByKnowledgeIdResult = useKnowledgeSelector(s => s.vectorsByKnowledgeIdResult);
  const selectKnowledge = useKnowledgeSelector(s => s.selectKnowledge);

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
      render: (_, record) => formatFileSize(record.size),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
      render: (_, record) => record.createTime ? dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '向量进度',
      dataIndex: 'vectorProgress',
      width: 200,
      render: (_, record) => (
        <>223</>
        // <Progress percent={record.vectorProgress} status={record.vectorProgress === 100 ? 'success' : 'active'} />
      ),
    },
  ];

  return (
    <ProTable<IKnowledgeVectorMetaVo>
      columns={columns}
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
