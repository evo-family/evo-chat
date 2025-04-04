import React, { FC, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { usePrevious, useUpdate, useUpdateEffect } from 'ahooks';

import { Splitter } from 'antd';
import cxb from 'classnames/bind';
import s from './SplitterPanel.module.scss';
import { useAntdToken } from '@evo/component';
import { useSettingSelector } from '@evo/data-store';

const cx = cxb.bind(s);

export interface ISplitterPanelProps {
  /**
   * 左侧内容
   */
  leftContent: React.ReactNode;
  leftVisible?: boolean;
  children?: React.ReactNode;
}

export const SplitterPanel: FC<ISplitterPanelProps> = React.memo((props) => {
  const { leftContent, children, leftVisible } = props;

  const leftVisibleRef = useRef(leftVisible);
  const lastRenderLeftVisble = leftVisibleRef.current;
  leftVisibleRef.current = leftVisible;
  const visibleChanged = leftVisible !== lastRenderLeftVisble;

  const token = useAntdToken();
  const forceFlush = useUpdate();

  useUpdateEffect(() => {
    setTimeout(forceFlush, 300);
  }, [visibleChanged]);

  return (
    <Splitter className={s.splitter}>
      <Splitter.Panel
        className={cx(['leftPanel', { 'collpase-transition': visibleChanged }])}
        defaultSize={260}
        min={200}
        max="70%"
        size={leftVisible ? 0 : undefined}
      >
        {leftContent}
      </Splitter.Panel>
      <Splitter.Panel
        className={s.message}
        style={{
          backgroundColor: token.colorBgLayout,
        }}
      >
        {children}
      </Splitter.Panel>
    </Splitter>
  );
});
