import { Button, Flex, Menu, Space, Typography } from 'antd';
import { EvoIcon, SearchInput } from '@evo/component';
import React, { FC, useMemo } from 'react';
import { useAgentLogic, useGlobalCtx } from '@evo/data-store';

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
  const [chatCtrl] = useGlobalCtx((ctx) => ctx.chatCtrl);

  const [searchText, setSearchText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('全部');

  const { tags, agents, filteredAgents } = useAgentLogic({ searchText, selectedTag });

  const navigate = useNavigate();

  const tagMenus = useMemo(() => {
    return tags.map((tag) => ({
      key: tag,
      label: tag,
      onClick: () => setSelectedTag(tag),
    }));
  }, [tags]);

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
        <Menu className={'evo-menu'} selectedKeys={[selectedTag]} mode="inline" items={tagMenus} />
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
