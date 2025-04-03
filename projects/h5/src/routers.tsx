import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { MainLayout } from './layouts/main-layout/MainLayout';
import { TabBarLayout } from './layouts/tab-bar-layout/TabBarLayout';

import { HomePage } from './pages/home/HomePage';
import { FilePage } from './pages/file/FilePage';
import { SettingPage } from './pages/settings/SettingPage';
import { AssistantPage } from './pages/assistant/AssistantPage';
import { ChatPage } from './pages/chat/ChatPage';
import { SettingAboutUsPage } from './pages/setting-about-us/SettingAboutUs';
import { SettingModelsPage } from './pages/setting-models/SettingModelsPage';
import { SettingGeneralPage } from './pages/setting-general/SettingGeneralPage';
import { SettingDataPage } from './pages/setting-data/SettingDataPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        element: <TabBarLayout />,
        children: [
          {
            path: 'home',
            element: <HomePage />,
          },
          {
            path: 'assistant',
            element: <AssistantPage />,
          },
          {
            path: 'file',
            element: <FilePage />,
          },
          {
            path: 'settings',
            element: <SettingPage />,
          },
        ],
      },
      {
        path: 'chat',
        element: <ChatPage />,
      },

      {
        path: 'setaboutus',
        element: <SettingAboutUsPage />,
      },

      {
        path: 'set-model',
        element: <SettingModelsPage />,
      },

      {
        path: 'set-general',
        element: <SettingGeneralPage />,
      },
      {
        path: 'set-data',
        element: <SettingDataPage />,
      },
    ],
  },
]);
