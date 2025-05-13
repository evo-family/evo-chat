import React, { FC } from 'react';
import { Button, message, Space } from 'antd';
import { FolderAddOutlined, FileAddOutlined, LinkOutlined } from '@ant-design/icons';
import { KnowledgeBridgeFactory } from '@evo/platform-bridge';
import { useKnowledgeSelector } from '../../knowledge-processor/KnowledgeProvider';
import { SearchVectors } from '../search-vectors/SearchVectors';

export interface IKnowledgeActionsProps {}

export const KnowledgeActions: FC<IKnowledgeActionsProps> = ({}) => {
  const selectKnowledge = useKnowledgeSelector((s) => s.selectKnowledge);
  const addFileToVector = useKnowledgeSelector((s) => s.addFileToVector);
  const addFolderToVector = useKnowledgeSelector((s) => s.addFolderToVector);

  const handleUploadFile = async () => {
    try {
      const result = await addFileToVector({
        knowledgeId: selectKnowledge?.id!,
      });
      if (result.success) {
        message.success('成功');
      } else {
        message.error(`上传失败: ${result.error || '未知错误'}`);
      }
    } catch (error) {
      message.error('上传文件时发生错误');
    }
  };
  const handleUploadDirectory = async () => {
    try {
      const result = await addFolderToVector({
        knowledgeId: selectKnowledge?.id!,
        // onProgress: (progress) => {
        // },
      });
      if (result.success) {
        message.success('成功');
      } else {
        message.error(`上传失败: ${result.error || '未知错误'}`);
      }
    } catch (error) {
      message.error('上传文件时发生错误');
    }
  };
  const handleWebsite = () => {};
  return (
    <Space>
      <SearchVectors />
      <Button
        className={'evo-button-icon'}
        color="default"
        variant="filled"
        icon={<LinkOutlined />}
        onClick={handleWebsite}
      >
        添加网址
      </Button>
      <Button
        className={'evo-button-icon'}
        color="default"
        variant="filled"
        icon={<FolderAddOutlined />}
        onClick={handleUploadDirectory}
      >
        上传文件夹
      </Button>
      <Button type="primary" icon={<FileAddOutlined />} onClick={handleUploadFile}>
        上传文件
      </Button>
    </Space>
  );
};
