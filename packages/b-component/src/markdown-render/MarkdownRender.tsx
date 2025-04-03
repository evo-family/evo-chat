import 'katex/dist/katex.min.css';

import { FC, memo, useMemo } from 'react';

import MarkdownPreview from '@uiw/react-markdown-preview';
import classNames from 'classnames';
import { formatBrackets } from '../utils/format';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import s from './MarkdownRender.module.scss';

export interface IMarkdownRenderProps {
  content: string;
  className?: string;
}

export const MarkdownRender: FC<IMarkdownRenderProps> = memo(({ content, className }) => {
  const formattedContent = useMemo(() => formatBrackets(content), [content]);

  return (
    <div className={classNames(s.markdown, className)}>
      <MarkdownPreview
        source={formattedContent}
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
      ></MarkdownPreview>
    </div>
  );
});
