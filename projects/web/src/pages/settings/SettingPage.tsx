import { Button, Flex, Menu } from 'antd';
import {
  CloseOutlined,
  DatabaseOutlined,
  InfoCircleOutlined,
  KeyOutlined,
  RobotOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import React, { FC, useRef, useState } from 'react';

import { AboutContent } from './setting-container/about-content/AboutContent';
import { ContentPanel } from '../../components';
import { DataContent } from './setting-container/data-content/DataContent';
import { GeneralContent } from './setting-container/general-content/GeneralContent';
import { ModelSection } from '../../bcomponents';
import { ShortcutContent } from './setting-container/shortcut-content/ShortcutContent';
import classNames from 'classnames';
import s from './SettingPage.module.scss';
import { useNavigate } from 'react-router';

const menuItems = [
  {
    key: 'model',
    icon: <RobotOutlined />,
    label: '模型设置',
  },
  // {
  //   key: 'account',
  //   icon: <UserOutlined />,
  //   label: '账号与安全',
  // },
  {
    key: 'general',
    icon: <SettingOutlined />,
    label: '通用设置',
  },
  {
    key: 'data',
    icon: <DatabaseOutlined />,
    label: '数据设置',
  },
  {
    key: 'shortcut',
    icon: <KeyOutlined />,
    label: '快捷键',
  },
  {
    key: 'about',
    icon: <InfoCircleOutlined />,
    label: '关于我们',
  },
];
export interface ISettingPageProps {}

export const SettingPage: FC<ISettingPageProps> = () => {
  const [selectedKey, setSelectedKey] = useState('model');
  const contentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleMenuSelect = (key: string) => {
    setSelectedKey(key);
    const element = document.getElementById(key);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClose = () => {
    // 先跳转到首页
    navigate('/');
  };

  const handleScroll = () => {
    if (selectedKey === 'model') return; // 模型设置页不参与滚动联动

    const sections = menuItems.slice(1).map((item) => ({
      key: item.key,
      element: document.getElementById(item.key),
    }));

    const scrollPosition = contentRef.current?.scrollTop || 0;

    for (const section of sections) {
      if (section.element) {
        const offsetTop = section.element.offsetTop;
        if (scrollPosition >= offsetTop - 100) {
          setSelectedKey(section.key);
        }
      }
    }
  };

  const toolbar = (
    <>
      <Button
        type="text"
        className="app-region-no-drag"
        icon={<CloseOutlined />}
        onClick={handleClose}
      />
    </>
  );

  const leftContent = (
    <Menu
      className={'evo-menu'}
      selectedKeys={[selectedKey]}
      items={menuItems}
      onClick={({ key }) => handleMenuSelect(key)}
    />
  );

  return (
    <ContentPanel title="设置" toolbar={toolbar} leftContent={leftContent}>
      <div
        ref={contentRef}
        className={classNames(s.content, {
          [s.scroll]: selectedKey !== 'model',
        })}
        onScroll={handleScroll}
      >
        {selectedKey === 'model' ? (
          <>
            {/* <span className={s.label}>模型设置</span> */}
            <ModelSection />
          </>
        ) : (
          <>
            {/* <section id="account">
              <h2>账号与安全</h2>
            </section> */}
            <section id="general" className={s['option-group']}>
              <span className={s.label}>通用</span>
              <GeneralContent />
            </section>

            <section id="data" className={s['option-group']}>
              <span className={s.label}>数据设置</span>
              <DataContent />
            </section>
            <section id="shortcut" className={s['option-group']}>
              <span className={s.label}>快捷键</span>
              <ShortcutContent />
            </section>
            <section id="about" className={s['option-group']}>
              <span className={s.label}>关于我们</span>
              <AboutContent />
            </section>
          </>
        )}
      </div>
    </ContentPanel>
  );
};
