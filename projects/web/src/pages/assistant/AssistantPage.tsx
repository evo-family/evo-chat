import { Button, Flex, Menu, Space, Typography } from 'antd';
import { EvoIcon, SearchInput } from '@evo/component';
import React, { FC, useEffect, useLayoutEffect, useMemo } from 'react';
import { agentsData, useGlobalCtx } from '@evo/data-store';

import { ContentPanel } from '../../components';
import { IAssistant } from '@evo/types';
import List from 'rc-virtual-list';
import style from './Style.module.scss';
import { useMemoizedFn } from 'ahooks';
import { useNavigate } from 'react-router';
import { useState } from 'react';

export interface IAssistantProps {}

const RenderAgent = React.forwardRef<
  any,
  { data: IAssistant; onClick?: (data: IAssistant) => any }
>((props, ref) => {
  const { data, onClick } = props;

  const renderAvatar = useMemoizedFn((avatar: string) => {
    // 判断是否为URL或Blob链接
    const isImageUrl =
      avatar.startsWith('http') || avatar.startsWith('blob') || avatar.startsWith('data:');

    if (isImageUrl) {
      return <img className={style['agent-avatar-img']} src={avatar} alt="avatar" />;
    }

    return <span className={style['agent-avatar-emoji']}>{avatar}</span>;
  });

  const handleClick = useMemoizedFn(() => {
    onClick?.(data);
  });
  return (
    <Flex ref={ref} className={style['agent-item']} align="center" justify="space-between">
      <Flex align="center" style={{ flex: 1 }}>
        <div className={style['agent-avatar']}>{renderAvatar(data.meta.avatar)}</div>
        <Flex vertical style={{ flex: 1 }}>
          <Typography.Text strong className={style['agent-title']}>
            {data.meta.title}
          </Typography.Text>
          <Typography.Text type="secondary" className={style['agent-secondary-title']}>
            {data.meta.description}
          </Typography.Text>
        </Flex>
      </Flex>
      <Button color="default" variant="filled" onClick={handleClick}>
        开启新对话
      </Button>
    </Flex>
  );
});

export const AssistantPage: FC<IAssistantProps> = React.memo((props) => {
  const [searchText, setSearchText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('全部');
  const [chatCtrl] = useGlobalCtx((ctx) => ctx.chatCtrl);
  const [agents, setAgents] = useState<IAssistant[]>([]);

  const navigate = useNavigate();

  // 收集所有不重复的标签并按使用频率排序
  const tags = useMemo(() => {
    const tagCount = new Map<string, number>();

    // 统计每个标签的使用次数
    agents.forEach((agent) => {
      agent.meta.tags?.forEach((tag) => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    });

    // 将标签按使用频率排序
    const sortedTags = Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);

    // 取前12个标签，其余放入"其他"类别
    const topTags = sortedTags.slice(0, 12);
    const hasOtherTags = sortedTags.length > 12;

    return ['全部', ...topTags, ...(hasOtherTags ? ['其他'] : [])];
  }, [agents]);

  // 修改过滤逻辑以支持"其他"类别
  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const searchLower = searchText.toLowerCase();
      const matchSearch = agent.meta.title.toLowerCase().includes(searchLower);
      const matchDescription = agent.meta.description.toLowerCase().includes(searchLower);
      let matchTag = selectedTag === '全部';

      if (!matchTag) {
        if (selectedTag === '其他') {
          // 对于"其他"类别，只显示标签不在前15个中的助手
          matchTag = agent.meta.tags?.every((tag) => !tags.slice(1, -1).includes(tag)) ?? false;
        } else {
          matchTag = agent.meta.tags?.includes(selectedTag) ?? false;
        }
      }

      return (matchSearch || matchDescription) && matchTag;
    });
  }, [searchText, selectedTag, tags, agents]);

  const handleSelectAgent = useMemoizedFn(async (data: IAssistant) => {
    const value = data.identifier;

    const selectedAgentInfo: IAssistant = agents.find(
      (agent) => agent.identifier === value
    ) as unknown as IAssistant;
    if (!selectedAgentInfo) return;

    navigate('/home');

    const newWinIns = await chatCtrl.createWindow(
      // todo_lcf 创建对话需要支持 agent参数
      { agentIds: [value] }
    );

    // 关闭弹窗并重置状态
    setSearchText('');
  });

  useLayoutEffect(() => {
    agentsData.globListen(
      (signal) => {
        setAgents(agentsData.getCellsValue({ all: true, getArray: true }).array as IAssistant[]);
      },
      { immediate: true, debounceTime: 100 }
    );
  }, [agentsData]);

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
          >
            添加助手
          </Button>
        </Space>
      }
      leftContent={
        <Menu
          className={'evo-menu'}
          selectedKeys={[selectedTag]}
          mode="inline"
          items={tags.map((tag) => ({
            key: tag,
            label: tag,
            onClick: () => setSelectedTag(tag),
          }))}
        />
      }
    >
      {/* <div className={style['search-container']}></div> */}
      {filteredAgents.length ? (
        <div className={style['agent-list']}>
          <List
            data={filteredAgents as unknown as IAssistant[]}
            height={window.innerHeight - 90} // 调整高度计算，预留更多空间
            itemHeight={88}
            itemKey="identifier"
          >
            {(agent: IAssistant) => (
              <RenderAgent key={agent.identifier} data={agent} onClick={handleSelectAgent} />
            )}
          </List>
        </div>
      ) : (
        <Flex vertical align="center" justify="center" style={{ height: '100%' }}>
          未搜索到结果
        </Flex>
      )}
    </ContentPanel>
  );
});
