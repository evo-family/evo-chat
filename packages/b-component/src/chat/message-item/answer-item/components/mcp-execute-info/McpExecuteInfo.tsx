import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import CodeMirror, { ReactCodeMirrorProps } from '@uiw/react-codemirror';
import { Collapse, Segmented, Tag } from 'antd';
import {
  EMCPExecuteStatus,
  IMCPExecuteRecord,
  useChatAnswerCtx,
  useChatAnswerOrgCtx,
  useChatWinCtx,
} from '@evo/data-store';
import React, { useDeferredValue, useLayoutEffect, useMemo, useState } from 'react';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { lintGutter, linter } from '@codemirror/lint';

import { BubbleChat } from '@/chat/bubble-chat/BubbleChat';
import style from './McpExecuteInfo.module.scss';
import { useCellValueSelector } from '@evo/utils';

const EXECUTE_PARAM = '调用参数';
const EXECUTE_RESULT = '结果';
const EXECUTE_STATUS_MAPPING = {
  [EMCPExecuteStatus.PENDING]: (
    <Tag icon={<SyncOutlined spin />} color="processing">
      执行中
    </Tag>
  ),
  [EMCPExecuteStatus.SUCCESS]: (
    <Tag icon={<CheckCircleOutlined />} color="success">
      成功
    </Tag>
  ),
  [EMCPExecuteStatus.ERROR]: (
    <Tag icon={<CloseCircleOutlined />} color="error">
      失败
    </Tag>
  ),
};

const McpExecuteRecord = (props: { record: IMCPExecuteRecord }) => {
  const { record } = props;
  const { mcp_id, tool_name, result, arguments: ececuteParams, status } = record;

  const [renderContentType, setRenderContentType] = useState(EXECUTE_PARAM);

  const extensions = useMemo<ReactCodeMirrorProps['extensions']>(() => {
    return [json(), linter(jsonParseLinter()), lintGutter()];
  }, []);

  const jsonText = useMemo(() => {
    const value = renderContentType === EXECUTE_RESULT ? result : ececuteParams;
    return JSON.stringify(value, null, 2);
  }, [ececuteParams, renderContentType]);

  return (
    <Collapse
      destroyInactivePanel
      bordered={false}
      size="small"
      items={[
        {
          key: '1',
          label: (
            <div className={style['execute-collpase-ltitle']}>
              <span>{tool_name}</span>
              <span className={style['split-line']}>|</span>
              <span>{EXECUTE_STATUS_MAPPING[status]}</span>
            </div>
          ),
          children: (
            <div className={style['mcp-execute-info']}>
              <div>
                <Segmented
                  value={renderContentType}
                  options={[EXECUTE_PARAM, EXECUTE_RESULT]}
                  onChange={setRenderContentType}
                />
              </div>
              <CodeMirror
                editable={false}
                className={style['json-editor']}
                readOnly
                value={jsonText}
                height="200px"
                extensions={extensions}
                // onChange={onChange}
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  highlightActiveLine: true,
                }}
              />
            </div>
          ),
        },
      ]}
    />
  );
};

export interface IReasoningRenderProps {
  turnIndex: number;
}

export const McpExecuteInfo = React.memo<IReasoningRenderProps>((props) => {
  const { turnIndex } = props;

  const [chatTurns] = useChatAnswerCtx((ctx) => ctx.chatTurnsCell);

  const mcpInfo = chatTurns.at(turnIndex)?.mcpInfo;
  console.log(1111, mcpInfo);

  if (!mcpInfo?.executeRecords?.length) return null;

  return mcpInfo.executeRecords?.map((item, index) => {
    return <McpExecuteRecord key={index} record={item} />;
  });
});
