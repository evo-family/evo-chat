import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

const tabBarVisibleAtom = atomWithStorage('tabBarVisible', true);

export const useTabBar = () => {
  const [visible, setVisible] = useAtom(tabBarVisibleAtom);

  const showTabBar = () => {
    console.debug('todo 待调试 ===== showTabBar');
    setVisible(true);
  };

  const hideTabBar = () => {
    console.debug('todo 待调试 ===== hideTabBar');
    setVisible(false);
  };

  return {
    visible,
    showTabBar,
    hideTabBar,
  };
};