import React, { FC, useMemo, useRef, useState } from 'react';
import { Menu } from 'antd';
import { UserOutlined, SettingOutlined, RobotOutlined } from '@ant-design/icons';
import s from './SettingContainer.module.scss';
import { GeneralContent } from './general-content/GeneralContent';
import { DatabaseOutlined, KeyOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { ModelSection } from '../../../bcomponents';
import { DataContent } from './data-content/DataContent';
import { ShortcutContent } from './shortcut-content/ShortcutContent';
import { AboutContent } from './about-content/AboutContent';
import classNames from 'classnames';

export const SettingContainer: FC = () => {
  return <div className={s.container}></div>;
};
