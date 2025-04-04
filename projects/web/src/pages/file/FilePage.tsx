import React, { FC, memo } from 'react';
import { FileProvider, useFileSelector } from './file-processor/FileProvider';
import { Splitter } from 'antd';
import { FieList } from './file-list/FileList';
import { FileMenu } from './file-menu/FileMenu';
import { KnowledgeProvider } from '../knowledge/knowledge-processor/KnowledgeProvider';
import { KnowledgeList } from '../knowledge/knowledge-list/KnowledgeList';
import { KnowledgeMenu } from '../knowledge/knowledge-menu/KnowledgeMenu';
import { useGlobalCtx } from '@evo/data-store';
import { ContentPanel, SplitterPanel } from '../../components';

export interface IFilePageContentProps {}

export const FilePageContent: FC<IFilePageContentProps> = memo((props) => {
  const type = useFileSelector((s) => s.type);
  const sliderVisible = useFileSelector((s) => s.sliderVisible);
  const setType = useFileSelector((s) => s.setType);
  const isFile = type === 'file';
  const leftContent = (
    <>
      <FileMenu selectable={isFile} onMenuClick={() => setType('file')} />
      <KnowledgeMenu selectable={!isFile} onMenuClick={() => setType('knowledge')} />
    </>
  );
  return (
    <ContentPanel
      title="资源中心"
      subTitle="管理文件资源和知识库内容，支持文件上传和知识库构建"
      leftContent={leftContent}
    >
      {isFile ? <FieList /> : <KnowledgeList />}
    </ContentPanel>
  );
});

export const FilePage = memo((props) => {
  return (
    <FileProvider>
      <KnowledgeProvider>
        <FilePageContent />
      </KnowledgeProvider>
    </FileProvider>
  );
});
