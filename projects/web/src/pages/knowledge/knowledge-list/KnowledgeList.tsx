import React, { FC } from 'react';
import { KnowledgeActions } from '../components/knowledge-actions/KnowledgeActions';
import { Tabs, TabsProps } from 'antd';
import { EvoIcon } from '@evo/component';

import s from './KnowledgeList.module.scss';
import { KnowledgeFileList } from './FileList';
import { KnowledgeWebsite } from './Website';
import { useKnowledgeSelector } from '../knowledge-processor/KnowledgeProvider';
import { KnowledgeBridgeFactory } from '@evo/platform-bridge';
import { useContentPanelSelector } from '../../../components';

export const KnowledgeList: FC = () => {
  const selectKnowledge = useKnowledgeSelector((s) => s.selectKnowledge);
  const ToolbarPortal = useContentPanelSelector((s) => s.ToolbarPortal);
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
    },
  ];

  return (
    <>
      <ToolbarPortal>
        <KnowledgeActions />
      </ToolbarPortal>
      <div className={s.container}>
        <Tabs items={items} defaultActiveKey="files"></Tabs>
      </div>
    </>
  );
};
