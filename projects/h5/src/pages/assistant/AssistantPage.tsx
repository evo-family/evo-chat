import { FC, useEffect, useLayoutEffect, useMemo } from 'react';
import { SearchBar, Button, List, Tabs } from 'antd-mobile';
import { InfiniteScroll } from 'antd-mobile';
import { MessageOutline } from 'antd-mobile-icons';
import { agentsData, useGlobalCtx } from '@evo/data-store';
import { useState } from 'react';
// import { useGlobalCtx } from '@evo/data-store';
import { useNavigate } from 'react-router';
import { IAssistant } from '@evo/types';
import { useMemoizedFn } from 'ahooks';


export interface IAssistantProps {
}

export const AssistantPage: FC<IAssistantProps> = props => {
  const [searchText, setSearchText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('全部');
  const [chatCtrl] = useGlobalCtx((ctx) => ctx.chatCtrl);
  const [agents, setAgents] = useState<IAssistant[]>([]);
  const navigate = useNavigate();
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [displayAgents, setDisplayAgents] = useState<IAssistant[]>([]);
  // 收集所有不重复的标签并按使用频率排序
  const tags = useMemo(() => {
    const tagCount = new Map<string, number>();
    
    // 统计每个标签的使用次数
    (agents  as unknown as IAssistant[]).forEach(agent => {
      agent.meta.tags?.forEach(tag => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    });

    // 将标签按使用频率排序
    const sortedTags = Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);

    // 取前8个标签，其余放入"其他"类别
    const topTags = sortedTags.slice(0, 8);
    const hasOtherTags = sortedTags.length > 8;
    console.log('topTags', topTags, ' hasOtherTags:', hasOtherTags, ' agents.length:', agents.length);
    return ['全部', ...topTags, ...(hasOtherTags ? ['其他'] : [])];
  }, [agents]);

  /// 修改 filteredAgents 的实现
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const searchLower = searchText.toLowerCase();
      const matchSearch = agent.meta.title.toLowerCase().includes(searchText.toLowerCase());
      const matchDescription = agent.meta.description.toLowerCase().includes(searchLower);
      let matchTag = selectedTag === '全部';
      
      if (!matchTag) {
        if (selectedTag === '其他') {
          matchTag = agent.meta.tags?.every(tag => !tags.slice(1, -1).includes(tag)) ?? false;
        } else {
          matchTag = agent.meta.tags?.includes(selectedTag) ?? false;
        }
      }
      
      return (matchSearch || matchDescription) && matchTag;
    });
  }, [searchText, selectedTag, tags, agents]);

  // 添加 filteredAgents 作为依赖
  useEffect(() => {
    // 仅加载第一页数据
    setDisplayAgents(filteredAgents.slice(0, pageSize));
    setHasMore(filteredAgents.length > pageSize);
  }, [selectedTag, searchText, filteredAgents, pageSize]); 

  useLayoutEffect(() => {
    agentsData.globListen(
      (signal) => {
        setAgents(agentsData.getCellsValue({ all: true, getArray: true }).array as IAssistant[]);
      },
      { immediate: true, debounceTime: 100 }
    );
  }, [agentsData]);


  const handleSelectAgent = useMemoizedFn(async (data: IAssistant) => {
    

    const identifier = data.identifier;

    const selectedAgentInfo: IAssistant = agents.find(
      (agent) => agent.identifier === identifier
    ) as unknown as IAssistant;
    if (!selectedAgentInfo) return;

    navigate('/home');

    // todo_lcf 检测窗口是否存在 并且避免创建
    // 如果不存在，创建新窗口
    const newWinIns = await chatCtrl.createWindow(
      // todo_lcf 创建对话需要支持 agent参数
      { agentIds: [identifier] }
    );

    // 关闭弹窗并重置状态
    setSearchText('');
  });

  
// 修改加载更多的处理函数
const loadMore = async () => {
  const start = displayAgents.length;
  const newAgents = filteredAgents.slice(start, start + pageSize);
  
  if (newAgents.length > 0) {
    setDisplayAgents((prev: IAssistant[]) => [...prev, ...((newAgents as unknown) as IAssistant[])]);
  }
  
  setHasMore(start + newAgents.length < filteredAgents.length);
};

  // 修改 useEffect 的依赖项和处理逻辑
  useEffect(() => {
    // 仅加载第一页数据
    setDisplayAgents([]);
    setHasMore(true);
  }, [selectedTag, searchText]); // 只在搜索条件变化时重置


  const renderAvatar = (avatar: string) => {
    // 判断是否为URL或Blob链接
    const isImageUrl = avatar.startsWith('http') || avatar.startsWith('blob') || avatar.startsWith('data:');
    
    if (isImageUrl) {
      return <img src={avatar} alt="avatar" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: '50%', backgroundColor: 'Background' }} />;
    }
    
    return <span style={{ fontSize: '24px' }}>{avatar}</span>;
  };
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#f5f5f5' }}>
        <SearchBar
          placeholder='搜索助手'
          onChange={setSearchText}
          style={{ 
            padding: '8px',
            '--background': '#ffffff'
          }}
        />
        
        <Tabs
          defaultActiveKey='全部'
          onChange={setSelectedTag}
          style={{ 
            color: '#666666',
            '--title-font-size': '14px',
            '--active-title-color': '#1677ff',
            '--active-line-color': '#1677ff',
            paddingTop: '8px'
          }}
          activeKey={selectedTag}
        >
          {tags.map(tag => (
            <Tabs.Tab title={tag} key={tag}>
              <List style={{ 
                '--padding-left': '16px',
                '--padding-right': '16px',
                height: 'calc(100vh - 144px)', // 调整高度以适应固定头部
                overflowY: 'auto'
              }}>
                {displayAgents.map(agent => (
                  <List.Item
                    key={agent.identifier}
                    prefix={renderAvatar(agent.meta.avatar)}
                    description={agent.meta.description}
                    arrow={false}
                    extra={
                      <Button
                        color='primary'
                        fill='outline'
                        size='small'
                        onClick={() => handleSelectAgent(agent)}
                      >
                        开启新对话
                      </Button>
                    }
                  >
                    <span style={{ 
                      color: '#1677ff',
                      fontWeight: 500,
                      fontSize: '16px'
                    }}>
                      {agent.meta.title}
                    </span>
                  </List.Item>
                ))}
                <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />
                </List>
          </Tabs.Tab>
        ))}
      </Tabs>
    </div>
  </div>
);
}

