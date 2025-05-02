import Picker from '@emoji-mart/react';
import { useSettingSelector } from '@evo/data-store';
import { EThemeMode } from '@evo/types';
import { Button, Dropdown, theme } from 'antd';
import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks';

interface EmojiProps {
  children?: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
}

export const Emoji: React.FC<EmojiProps> = ({ children, value: externalValue, onChange }) => {
  const [open, setOpen] = useState(false);
  const [emojiData, setEmojiData] = useState<any>(null);
  const [internalValue, setInternalValue] = useState(externalValue || '');
  const theme = useTheme();
  useEffect(() => {
    setInternalValue(externalValue || '');
  }, [externalValue]);

  useEffect(() => {
    const loadEmojiData = async () => {
      try {
        const data = await import('./data.json');
        setEmojiData(data);
      } catch (error) {
        console.error('加载 emoji 数据失败:', error);
      }
    };

    loadEmojiData();
  }, []);

  const handleEmojiSelect = (emoji: any) => {
    const newValue = emoji.native;
    setInternalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
    setOpen(false);
  };

  const dropdownContent = emojiData ? (
    <Picker
      data={emojiData}
      onEmojiSelect={handleEmojiSelect}
      locale="zh"
      theme={theme}
      previewPosition="none"
    />
  ) : null;

  const defaultChildren = (
    <Button style={{ width: 32, height: 32, fontSize: 20 }}>{internalValue || ' '}</Button>
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      dropdownRender={() => dropdownContent}
      trigger={['click']}
      placement={'topLeft'}
    >
      {children || defaultChildren}
    </Dropdown>
  );
};

export default Emoji;
