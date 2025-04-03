import { Avatar, Badge, Button, Input, Select, SelectProps, Space, Tag, Tooltip } from 'antd';
import React, { FC, memo, useMemo, useRef, useState } from 'react';
import { EvoIcon } from '../../../icon';
import { KnowledgeBridgeFactory } from '@evo/platform-bridge';
import { useAsyncEffect, useRequest } from 'ahooks';
import classNames from 'classnames';
import { useSenderSelector } from '../sender-processor/SenderProvider';
import { useChatWinCtx } from '@evo/data-store';

export interface IKnowledgeToolbarProps {}

export const KnowledgeToolbar: FC<IKnowledgeToolbarProps> = memo((props) => {
  const [searchText, setSearchText] = useState('');
  const [selectValues, setSelectValues] = useState<string[]>([]);
  const selectRef = useRef<any>(null);
  const [chatWin] = useChatWinCtx((ctx) => ctx.chatWin);
  const knowledgeSelectOpen = useSenderSelector((s) => s.knowledgeSelectOpen);
  const setKnowledgeSelectOpen = useSenderSelector((s) => s.setKnowledgeSelectOpen);
  const senderRef = useSenderSelector((s) => s.senderRef);

  const { data: knowledgeList } = useRequest(
    async () => {
      const result = await KnowledgeBridgeFactory.getKnowledge().getList();
      return result.data || [];
    },
    {
      refreshOnWindowFocus: false,
    }
  );

  // 设置默认当前选中
  useAsyncEffect(async () => {
    const ids = chatWin.getConfigState('knowledgeIds');
    setSelectValues(ids || []);
  }, [chatWin]);

  const knowledgeOptions = useMemo(() => {
    return knowledgeList?.map((item) => ({
      label: <Space align="center">{item.name}</Space>,
      value: item.id,
    }));
  }, [knowledgeList]);

  const handleChange = async (values: string[]) => {
    // 始终只取最后选择的那个值
    // const lastValue = values[values.length - 1];
    // lastValue ? [lastValue] : []
    setSelectValues(values);
    chatWin.updateConfigKnowledgeIds(values);
    setKnowledgeSelectOpen(false);
    senderRef.current?.focus();
  };

  const tagRender: SelectProps['tagRender'] = (props) => {
    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const knowledge = knowledgeList?.find((k) => k.id === value);

    return (
      <Tag
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{ marginInlineEnd: 4 }}
        bordered={false}
      >
        <Space size={2} align="center">
          {knowledge?.name}
        </Space>
      </Tag>
    );
  };

  React.useEffect(() => {
    if (knowledgeSelectOpen) {
      requestAnimationFrame(() => {
        selectRef.current?.focus();
      });
    }
  }, [knowledgeSelectOpen]);

  const filteredOptions = useMemo(() => {
    if (!searchText) return knowledgeOptions;
    return knowledgeOptions?.filter((option) =>
      (option.label as any).props.children
        .toString()
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );
  }, [knowledgeOptions, searchText]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Tooltip
        title={
          selectValues.length > 0
            ? `已选择: ${selectValues
                .map((id) => knowledgeList?.find((k) => k.id === id)?.name)
                .filter(Boolean)
                .join('、')}`
            : '选择知识库'
        }
      >
        <Button
          className={classNames('evo-button-icon')}
          color={selectValues?.length ? 'primary' : 'default'}
          size="small"
          variant="text"
          icon={<EvoIcon size={'small'} type="icon-knowledge" />}
          onClick={() => {
            setKnowledgeSelectOpen(!knowledgeSelectOpen);
          }}
        />
      </Tooltip>
      <Select
        ref={selectRef}
        style={{ width: 0 }}
        mode="multiple"
        tagRender={tagRender}
        maxCount={4}
        maxTagCount={'responsive'}
        suffixIcon={null}
        maxTagTextLength={5}
        showSearch={false}
        value={selectValues}
        getPopupContainer={(triggerNode) => {
          return (triggerNode.parentNode as HTMLElement) || document.body;
        }}
        onChange={handleChange}
        options={filteredOptions}
        onDropdownVisibleChange={setKnowledgeSelectOpen}
        open={knowledgeSelectOpen}
        dropdownStyle={{ width: 200, left: -30 }}
        variant="borderless"
        dropdownRender={(menu) => (
          <div>
            <div style={{ padding: '8px' }}>
              <Input
                placeholder="搜索知识库"
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
                suffix={<EvoIcon type="icon-search" size="small" style={{ color: '#999' }} />}
              />
            </div>
            {menu}
          </div>
        )}
      />
    </div>
  );
});
