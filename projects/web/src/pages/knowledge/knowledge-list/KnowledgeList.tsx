import React, { FC } from 'react';
import { KnowledgeActions } from '../components/knowledge-actions/KnowledgeActions';
import { Tabs, TabsProps } from 'antd';
import { EvoIcon } from '@evo/component';

import s from './KnowledgeList.module.scss';
import { KnowledgeFileList } from './FileList';
import { KnowledgeWebsite } from './Website';
import { useKnowledgeSelector } from '../knowledge-processor/KnowledgeProvider';
import { KnowledgeBridgeFactory } from '@evo/platform-bridge';

export const KnowledgeList: FC = () => {

  const selectKnowledge = useKnowledgeSelector(s => s.selectKnowledge)

  const items: TabsProps['items'] = [
    {
      key: 'file',
      label: '文件',
      children: <KnowledgeFileList />,
    },
    {
      key: 'website',
      label: '网址',
      children: <KnowledgeWebsite />,
    }
  ];

  // 搜索向量数据
  // KnowledgeBridgeFactory.getKnowledge().searchVectors({})

  return (
    <div className={s.container}>
      <EvoIcon type="icon-yuyin" size={20} />
      <div className={s.header}>
        <KnowledgeActions />
      </div>
      <div className={s.content}>
        <Tabs items={items} defaultActiveKey="files">
        </Tabs>
      </div>
    </div>
  );
};

