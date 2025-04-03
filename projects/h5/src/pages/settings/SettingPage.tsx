import React, { FC, useEffect, useState } from 'react';
import s from './SettingPage.module.scss';
import List from 'antd-mobile/es/components/list';
import { AaOutline, HistogramOutline, InformationCircleOutline, KeyOutline, SetOutline, UserOutline, SoundOutline, EyeFill } from 'antd-mobile-icons';
import { Popover, CheckList, setDefaultConfig } from 'antd-mobile';
import enUS from 'antd-mobile/es/locales/en-US'
import zhCN from 'antd-mobile/es/locales/zh-CN';
import { useSettingSelector } from '@evo/data-store';
import { EThemeMode } from '@evo/types';
import { useNavigate } from 'react-router';
export interface ISettingPageProps { }

const menuItems = [
  {
    key: 'set-model',
    icon: <AaOutline />,
    label: '模型设置',
  },
  // {
  //   key: 'account',
  //   icon: <UserOutline />,
  //   label: '账号与安全',
  // },
  {
    key: 'set-general',
    icon: <SetOutline />,
    label: '通用',
  },
  {
    key: 'set-data',
    icon: <HistogramOutline />,
    label: '数据设置',
  },
  // { todo_lcf 待接入
  //   key: 'shortcut',
  //   icon: <KeyOutline />,
  //   label: '快捷键',
  // },
  {
    key: 'setaboutus',
    icon: <InformationCircleOutline />,
    label: '关于我们',
  },
];
const themeOptions = [
  { value: 'system', label: '跟随系统' },
  { value: 'dark', label: '深色' },
  { value: 'light', label: '浅色' },
];

const languageOptions = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
];

export const SettingPage: FC<ISettingPageProps> = () => {
  const navigate = useNavigate();
  const [popoverVisible, setPopoverVisible] = useState(false);
  // const [currentTheme, setCurrentTheme] = useState(['system']);
  const [theme, setTheme] = useSettingSelector(s => [s.theme, s.setTheme])

  useEffect(() => {
    changeTheme(theme)
  }, [theme])

  const handleThemeChange = (value: string[]) => {
    const theme = value.slice(-1)[0];
    // setCurrentTheme([theme]);
    setPopoverVisible(false);
    changeTheme(theme);
    // localStorage.setItem('theme-preference', theme); // 保存主题设置
  };

  const [languagePopoverVisible, setLanguagePopoverVisible] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(['zh']);

  const handleLanguageChange = (value: string[]) => {
    const lang = value.slice(-1)[0];
    setCurrentLanguage([lang]);
    setLanguagePopoverVisible(false);
    changeLanguage(lang);
    // localStorage.setItem('language-preference', lang);
    // todo_lcf 待调试接入  Context 赋值
  };

  const changeLanguage = (lang: string) => {
    // 这里可以集成具体的国际化方案
    console.log('changeLanguage: ' + lang);
    if (lang === 'zh') {
      // 中文
      setDefaultConfig({
        locale: zhCN
      })
    } else if (lang === 'en') {
      // 英文
      setDefaultConfig({
        locale: enUS
      });
    }
  };

  useEffect(() => {
    // // 读取保存的主题
    // const savedTheme = localStorage.getItem('theme-preference');
    // if (savedTheme) {
    //   // setCurrentTheme([savedTheme]);
    //   changeTheme(savedTheme);
    // }
    // 读取保存的语言
    const savedLanguage = localStorage.getItem('language-preference');
    if (savedLanguage) {
      setCurrentLanguage([savedLanguage]);
      changeLanguage(savedLanguage);
    }
  }, []);


  const changeTheme = (theme: string) => {
    console.log('changeTheme ' + theme)
    const root = document.documentElement;

    setTheme(theme as EThemeMode)

    if (theme === 'dark') {
      root.setAttribute('data-prefers-color-scheme', 'dark');
      root.style.setProperty('--adm-color-background', '#000');
      root.style.setProperty('--adm-color-text', '#fff');
      root.style.setProperty('--adm-color-text-secondary', 'rgba(255, 255, 255, 0.7)');
      root.style.setProperty('--adm-border-color', '#333');
      root.style.setProperty('--adm-color-fill-content', '#1a1a1a');
    } else if (theme === 'light') {
      root.setAttribute('data-prefers-color-scheme', 'light');
      root.style.setProperty('--adm-color-background', '#fff');
      root.style.setProperty('--adm-color-text', '#333');
      root.style.setProperty('--adm-color-text-secondary', '#666');
      root.style.setProperty('--adm-border-color', '#eee');
      root.style.setProperty('--adm-color-fill-content', '#f5f5f5');
    } else {
      // 跟随系统
      root.removeAttribute('data-prefers-color-scheme');
      root.style.removeProperty('--adm-color-background');
      root.style.removeProperty('--adm-color-text');
      root.style.removeProperty('--adm-color-text-secondary');
      root.style.removeProperty('--adm-border-color');
      root.style.removeProperty('--adm-color-fill-content');
    }
  }
  return (
    <div className={s.page}>
      <List className={s.list} header='设置'>
        {menuItems.map(item => (
          <List.Item className={s.item} prefix={item.icon} onClick={() => { 
            //alert('点击了 可点击列表' + item.key)
            navigate(`/${item.key}`)
           }}>
            {item.label}
          </List.Item>
        ))}


        {/* <List.Item
          className={s.item}  // 添加这行，保持与其他列表项一致的样式
          prefix={<EyeFill />}
          arrow
        >
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            主题设置
            <Popover
              visible={popoverVisible}
              onVisibleChange={setPopoverVisible}
              content={
                <CheckList
                  className={s.themeList}
                  value={[theme]}
                  // @ts-ignore
                  onChange={handleThemeChange}
                >
                  {themeOptions.map(option => (
                    <CheckList.Item key={option.value} value={option.value}>
                      {option.label}
                    </CheckList.Item>
                  ))}
                </CheckList>
              }
              trigger='click'
              placement='bottomLeft'
            >
              <span className={s.currentTheme}>
                {themeOptions.find(t => t.value === theme)?.label}
              </span>
            </Popover>
          </div>
        </List.Item>

        // 语言设置
        <List.Item
          className={s.item}
          prefix={<SoundOutline />}
          arrow
        >
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            语言设置
            <Popover
              visible={languagePopoverVisible}
              onVisibleChange={setLanguagePopoverVisible}
              content={
                <CheckList
                  className={s.themeList}
                  value={currentLanguage}
                  // @ts-ignore
                  onChange={handleLanguageChange}
                >
                  {languageOptions.map(option => (
                    <CheckList.Item key={option.value} value={option.value}>
                      {option.label}
                    </CheckList.Item>
                  ))}
                </CheckList>
              }
              trigger='click'
              placement='bottomLeft'
            >
              <span className={s.currentTheme}>
                {languageOptions.find(t => t.value === currentLanguage[0])?.label}
              </span>
            </Popover>
          </div>
        </List.Item> */}
      </List>

    </div>
  );
};