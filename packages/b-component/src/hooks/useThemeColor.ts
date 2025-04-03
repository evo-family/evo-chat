import { themeColorData, useSettingSelector } from '@evo/data-store';
import { EThemeMode } from '@evo/types';
import { useTheme } from './useTheme';
import { useMemo } from 'react';

export const useThemeColor = () => {
  const theme = useTheme();
  const themeColorId = useSettingSelector((s) => s?.themeColorId);

  return  useMemo(() =>{
    const themeColor = themeColorData.find(color => color?.value === themeColorId) || themeColorData[0];
    return theme === EThemeMode.Dark ? themeColor.darkColor : themeColor.color;
  },[theme, themeColorId])

};
