import React, { FC, memo, useState } from 'react';
import { Button, Input, Modal, List, Typography, Card, Badge } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import s from './SearchVectors.module.scss';
import { useKnowledgeSelector } from '../../knowledge-processor/KnowledgeProvider';

const { Search } = Input;
const { Text } = Typography;

export interface ISearchVectorsProps {
}

export const SearchVectors: FC<ISearchVectorsProps> = memo((props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searched, setSearched] = useState(false);

  const selectKnowledge = useKnowledgeSelector(s => s.selectKnowledge)

  const searchVectors = useKnowledgeSelector(s => s.searchVectors)
  const searchVectorsResult = useKnowledgeSelector(s => s.searchVectorsResult)

  const handleSearch = (value: string) => {
    setSearched(true);
    searchVectors({
      knowledgeId: selectKnowledge?.id!,
      searchValue: value,
    })
  };

  return (
    <div className={s.container}>
      <Button
        type="primary"
        icon={<SearchOutlined />}
        onClick={() => {
          setIsModalOpen(true);
          setSearched(false);
        }}
      >
        搜索
      </Button>

      <Modal
        title="向量搜索"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSearched(false);
        }}
        footer={null}
        width={800}
      >
        <Search
          placeholder="请输入搜索内容"
          allowClear
          enterButton="搜索"
          size="large"
          onSearch={handleSearch}
        />

        <List
          className={s.resultList}
          dataSource={searchVectorsResult?.data || []}
          locale={{
            emptyText: searched ? '暂无搜索结果' : '请输入搜索内容'
          }}
          renderItem={(item, index) => (
            <List.Item className={s.item}>
              <Badge.Ribbon
                text={`相似度：${(item.score * 100).toFixed(1)}%`}
                color={item.score > 0.8 ? 'green' : item.score > 0.5 ? 'blue' : 'orange'}
              >
                <Card className={s.resultCard}>
                  <List.Item.Meta
                    description={
                      <div className={s.resultContent}>
                        <Text>{item.pageContent}</Text>
                        <div className={s.resultSource}>
                          <Text type="secondary">来源: {item.metadata.source}</Text>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Badge.Ribbon>
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
});

