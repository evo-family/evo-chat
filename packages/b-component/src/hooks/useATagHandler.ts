import { useEffect } from 'react';
import { isElectron, openUrl } from '@evo/utils';

/**
 * 处理a标签点击事件
 */
export const useATagHandler = () => {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.hasAttribute('href')) {
        e.preventDefault();
        e.stopPropagation();
        const href = link.getAttribute('href');
        if (href) {
          openUrl(href);
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);
};
