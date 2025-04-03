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

      // link.getAttribute('target') === '_blank'
      if (link) {
        e.preventDefault();
        e.stopPropagation();  // 阻止事件冒泡
        const href = link.getAttribute('href');
        if (href) {
          openUrl(href);
        }
      }
    };

    document.addEventListener('click', handleClick, true);  // 使用捕获阶段
    return () => document.removeEventListener('click', handleClick, true);
  }, []);
};