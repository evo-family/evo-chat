import {
  App,
  Button,
  Empty,
  Flex,
  List,
  Menu,
  Space,
  Switch,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { AssistantAvatar, Emoji, EvoIcon, SearchInput } from '@evo/component';
import React, { FC, useMemo, useRef } from 'react';
import {
  useAssistantCreateWindow,
  useAssistantLogic,
  useAssistantOperation,
} from '@evo/data-store';

import { ContentPanel } from '../../components';
import { IAssistantCategory, IAssistantMeta } from '@evo/types';
import VirtualList from 'rc-virtual-list';
import style from './Style.module.scss';
import { useMemoizedFn } from 'ahooks';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { AddOrUpdateAssistant } from './components/add-or-update/AddOrUpdateAssistant';
import { TableDropdown } from '@ant-design/pro-components';
import { AssistantProvider, useAssistantSelector } from './assistant-processor/AssistantProvider';
import { PromptModal } from './components/prompt-modal/PromptMoal';

export interface IAssistantProps {}

const RenderAgent = React.forwardRef<
  any,
  { data: IAssistantMeta; onClick?: (data: IAssistantMeta) => any }
>((props, ref) => {
  const { data, onClick } = props;

  const { modal } = App.useApp();

  const setUpdateModalData = useAssistantSelector(
    (s) => s.addOrUpdateAssistantDialog.setUpdateModalData
  );

  const setDialogData = useAssistantSelector((s) => s.addOrUpdateAssistantDialog.setDialogData);
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
                <Tag style={{ color: `var(--evo-color-text-tertiary)` }} key={tag} bordered={false}>
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        }
        description={data.description}
      />
      <Space>
        <Tooltip title="设为常用助手">
          <Switch size="small" checked={data.isFrequent} onChange={handleFrequentChange} />
        </Tooltip>
        <PromptModal data={data} />
        <Button color="default" variant="filled" onClick={handleClick}>
          开启新对话
        </Button>
      </Space>
    </List.Item>
  );
});

interface IAssistantPageContentProps {}

const AssistantPageContent: FC<IAssistantPageContentProps> = React.memo((props) => {
  const [searchText, setSearchText] = useState('');

  const setCreateModalData = useAssistantSelector(
    (s) => s.addOrUpdateAssistantDialog.setCreateModalData
  );
  const [selectedCategoryId, setSelectedCategoryId] = useAssistantSelector((s) => [
    s.selectedCategoryId,
    s.setSelectedCategoryId,
  ]);
  const { filteredAssistants, categories } = useAssistantLogic({
    searchText,
    selectedCategoryId,
  });

  const categoryMenu = useMemo(() => {
    return categories.map((category) => ({
      key: category.id,
      label: (
        <Flex justify="space-between" align="center" style={{ width: '100%' }}>
          <span>{category.name}</span>
          <Typography.Text type="secondary">({category.count})</Typography.Text>
        </Flex>
      ),
      onClick: () => {
        setSelectedCategoryId(category.id);
      },
    }));
  }, [categories]);

  const selectCategory = useMemo(() => {
    return categories.find((f) => f.id === selectedCategoryId);
  }, [selectedCategoryId]);

  const handleSelectAgent = useMemoizedFn(async (data: IAssistantMeta) => {});

  return (
    <ContentPanel
      title="AI助手工具"
      subTitle="无论你是在工作中需要提高效率，还是在生活中寻求帮助，都可以找到你需要的工具来增强你的能力"
      toolbar={
        <Space>
          <SearchInput
            style={{ width: 200 }}
            placeholder="搜索助手"
            onSearch={(value) => setSearchText(value)}
          />
          <Button
            className={'evo-button-icon'}
            color="default"
            variant="filled"
            icon={<EvoIcon size={'small'} type="icon-assistant" />}
            onClick={() => setCreateModalData()}
          >
            添加助手
          </Button>
        </Space>
      }
      leftContent={
        <Menu
          className={'evo-menu'}
          selectedKeys={[selectedCategoryId]}
          mode="inline"
          items={categoryMenu}
        />
      }
    >
      {/* <div className={style['search-container']}></div> */}
      {filteredAssistants.length ? (
        <div className={style['agent-list']}>
          <List>
            <VirtualList
              data={filteredAssistants as unknown as IAssistantMeta[]}
              height={window.innerHeight - 90} // 调整高度计算，预留更多空间
              itemHeight={88}
              itemKey="id"
            >
              {(item: IAssistantMeta) => (
                <RenderAgent key={item.id} data={item} onClick={handleSelectAgent} />
              )}
            </VirtualList>
          </List>
        </div>
      ) : (
        <Flex vertical align="center" justify="center" style={{ height: '100%' }}>
          {selectCategory?.count === 0 ? (
            <Empty description={`当前分类 "${selectCategory.name}" 暂无助手`} />
          ) : (
            <Empty description={`未找到包含 "${searchText}" 的助手`} />
          )}
        </Flex>
      )}
    </ContentPanel>
  );
});

export const AssistantPage: FC<IAssistantProps> = React.memo((props) => {
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
