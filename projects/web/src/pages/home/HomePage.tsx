import { Button, Splitter } from 'antd';
import {
  ChatWinContextProvider,
  useChatWinCtx,
  useGlobalCtx,
  useSettingSelector,
} from '@evo/data-store';
import { HomeProvider, useHomeSelector } from './home-processor/HomeProvider';
import React, { FC, memo, useEffect, useState } from 'react';

import { ChatList } from './chat-list/ChatList';
import { ChatMessage } from './chat-message/ChatMessage';
import { SplitterPanel } from '../../components';

export interface IHomePageContentProps {}

export const HomePageContent: FC<IHomePageContentProps> = memo((props) => {
  const sliderVisible = useHomeSelector((s) => s.sliderVisible);
  const [curWinId] = useGlobalCtx((ctx) => ctx.curWinId);

  return (
    <SplitterPanel leftVisible={sliderVisible} leftContent={<ChatList />}>
      <ChatWinContextProvider>
        <ChatMessage />
      </ChatWinContextProvider>
    </SplitterPanel>
  );
});

export interface IHomePageProps {}
export const HomePage: FC<IHomePageProps> = memo((props) => {
  return (
    <HomeProvider>
      <HomePageContent />
    </HomeProvider>
  );
});

const str =
  '\n\n以下是一些随机生成的数学公式示例（使用 LaTeX 格式）：\n\n1. 积分公式：  \n   \\[\n   \\int_{-\\infty}^{\\infty} e^{-x^2} \\, dx = \\sqrt{\\pi}\n   \\]\n   （高斯积分）\n\n2. 代数恒等式：  \n   \\[\n   (a + b)^3 = a^3 + 3a^2b + 3ab^2 + b^3\n   \\]\n\n3. 欧拉公式：  \n   \\[\n   e^{i\\pi} + 1 = 0\n   \\]\n\n4. 三角函数和差公式：  \n   \\[\n   \\sin(a \\pm b) = \\sin a \\cos b \\pm \\cos a \\sin b\n   \\]\n\n5. 二次方程求根公式：  \n   \\[\n   x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\n   \\]\n\n6. 泰勒展开：  \n   \\[\n   \\cos x = \\sum_{n=0}^{\\infty} \\frac{(-1)^n x^{2n}}{(2n)!}\n   \\]\n\n7. 矩阵乘法：  \n   \\[\n   \\begin{bmatrix}\n   a & b \\\\\n   c & d \\\\\n   \\end{bmatrix}\n   \\begin{bmatrix}\n   e & f \\\\\n   g & h \\\\\n   \\end{bmatrix}\n   =\n   \\begin{bmatrix}\n   ae + bg & af + bh \\\\\n   ce + dg & cf + dh \\\\\n   \\end{bmatrix}\n   \\]\n\n8. 随机概率公式：  \n   \\[\n   P(A \\cup B) = P(A) + P(B) - P(A \\cap B)\n   \\]\n\n9. 微分方程示例：  \n   \\[\n   \\frac{dy}{dx} + P(x)y = Q(x)\n   \\]\n   （一阶线性微分方程）\n\n10. 几何级数求和：  \n    \\[\n    \\sum_{k=0}^{\\infty} ar^k = \\frac{a}{1-r} \\quad (|r| < 1)\n    \\]\n\n需要特定类型的公式可以告诉我！';
