import { SearchBar, Space, Swiper, SwiperRef, Tabs } from 'antd-mobile';
import { FC, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  AssistantProvider,
  useAssistantCreateWindow,
  useAssistantLogic,
  useAssistantOperation,
  useAssistantSelector,
  useGlobalCtx,
} from '@evo/data-store';
import VirtualList from 'rc-virtual-list';

import { useState } from 'react';
import { ContentPanel } from '../../components';
import { IAssistantMeta } from '@evo/types';
import s from './Style.module.scss';
import React from 'react';
import { App, Tooltip, List, Tag, Button, Switch } from 'antd';
import { useMemoizedFn } from 'ahooks';
import { TableDropdown } from '@ant-design/pro-components';
import { AssistantAvatar, Emoji } from '@evo/component';
import { AddOrUpdateAssistant } from './components/add-or-update/AddOrUpdateAssistant';
import { PromptModal } from './components/prompt-modal/PromptMoal';

const RenderAgent = React.forwardRef<
  any,
  { data: IAssistantMeta; onClick?: (data: IAssistantMeta) => any }
>((props, ref) => {
  const { data, onClick } = props;

  const { modal } = App.useApp();

  const setUpdateModalData = useAssistantSelector(
    (s) => s.addOrUpdateAssistantDialog.setUpdateModalData
  );

  const setDialogData = useAssistantSelector(
    (s) => s.addOrUpdateAssistantDialog.setDialogData
  );
  const { createAssistantWindow } = useAssistantCreateWindow();

  const { updateAssistant, deleteAssistant } = useAssistantOperation();

  const handleClick = useMemoizedFn(() => {
    createAssistantWindow(data);
  });

  const handleFrequentChange = useMemoizedFn((checked: boolean) => {
    updateAssistant({
      ...data,
      isFrequent: checked,
    });
  });

  const handleEdit = () => {
    setUpdateModalData({
      data,
    });
  };
  const handleCopy = () => {
    setDialogData({
      type: 'copy',
      open: true,
      data: { ...data, title: `复制 ${data.title}` },
    });
  };

  const handleEmojiChange = (emoji: string) => {
    updateAssistant({
      ...data,
      avatar: emoji,
    });
  };

  const isMy = data.category === 'my';

  return (
    <List.Item
      styles={{
        actions: {
          marginLeft: 20,
        },
      }}
      key={data.id}
      actions={
        isMy
          ? [
            <a key="edit" onClick={handleEdit}>
              编辑
            </a>,
            <TableDropdown
              key="more"
              onSelect={(key) => {
                if (key === 'delete') {
                  modal.confirm({
                    title: '确认删除',
                    content: `确定要删除助手 "${data.title}" 吗？`,
                    okText: '确定',
                    cancelText: '取消',
                    onOk: () => {
                      deleteAssistant(data.id);
                    },
                  });
                }

                if (key === 'copy') {
                  handleCopy();
                }
              }}
              menus={[
                { key: 'copy', name: '复制' },
                { key: 'delete', danger: true, name: '删除' },
              ]}
            />,
          ]
          : [
            <a key="copy" onClick={handleCopy}>
              复制
            </a>,
          ]
      }
    >
      <List.Item.Meta
        avatar={
          <>
            {isMy ? (
              <Emoji value={data.avatar} onChange={handleEmojiChange}>
                {
                  <span style={{ cursor: 'pointer' }}>
                    <AssistantAvatar avatar={data.avatar} width={48} />
                  </span>
                }
              </Emoji>
            ) : (
              <AssistantAvatar avatar={data.avatar} width={48} />
            )}
          </>
        }
        title={
          <div>
            {data.title}
            <div style={{ marginTop: 2 }}>
              {data.tags.map((tag) => (
                <Tag
                  style={{ color: `var(--evo-color-text-tertiary)` }}
                  key={tag}
                  bordered={false}
                >
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        }
        description={data.description}
      />
      {/* <Space>
        <Tooltip title="设为常用助手">
          <Switch
            size="small"
            checked={data.isFrequent}
            onChange={handleFrequentChange}
          />
        </Tooltip>
        <PromptModal data={data} />
        <Button color="default" variant="filled" onClick={handleClick}>
          开启新对话
        </Button>
      </Space> */}
    </List.Item>
  );
});

export interface IAssistantPageContentProps { }

export const AssistantPageContent: FC<IAssistantPageContentProps> = (props) => {
  const swiperRef = useRef<SwiperRef>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchText, setSearchText] = useState('');

  const [selectedCategoryId, setSelectedCategoryId] = useAssistantSelector(
    (s) => [s.selectedCategoryId, s.setSelectedCategoryId]
  );

  const { filteredAssistants, categories } = useAssistantLogic({
    searchText,
    selectedCategoryId,
  });

  const selectedCategoryIdByIndex = (index: number) => {
    const category = categories[index];
    setSelectedCategoryId(category.id);
  };


  return (
    <ContentPanel hiddenToolbarBack title="助手">
      <Tabs
        activeKey={categories?.[activeIndex].id}
        onChange={(key) => {
          const index = categories.findIndex((item) => item.id === key);
          setActiveIndex(index);
          selectedCategoryIdByIndex(index);
          swiperRef.current?.swipeTo(index);
        }}
      >
        {categories.map((item) => (
          <Tabs.Tab title={item.name} key={item.id} />
        ))}
      </Tabs>
      <Swiper
        direction="horizontal"
        loop
        indicator={() => null}
        ref={swiperRef}
        defaultIndex={activeIndex}
        onIndexChange={(index) => {
          setActiveIndex(index);
          selectedCategoryIdByIndex(index);
        }}
      >
        {categories.map((category) => (
          <Swiper.Item key={category.id}>
            {category.id === selectedCategoryId && (
              <div className={s['agent-list']}>
                <List>
                  <VirtualList
                    data={filteredAssistants as unknown as IAssistantMeta[]}
                    height={window.innerHeight - 190} // 调整高度计算，预留更多空间
                    itemHeight={88}
                    itemKey="id"
                  >
                    {(item: IAssistantMeta) => (
                      <RenderAgent key={item.id} data={item} />
                    )}
                  </VirtualList>
                </List>
              </div>
            )}
          </Swiper.Item>
        ))}
      </Swiper>
    </ContentPanel>
  );
};

export const AssistantPage = React.memo((props) => {
  return (
    <>
      <AssistantProvider>
        <>
          <AddOrUpdateAssistant />
          <AssistantPageContent />
        </>
      </AssistantProvider>
    </>
  );
});
