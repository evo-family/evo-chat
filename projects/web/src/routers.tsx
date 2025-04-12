import React from 'react';
import { createHashRouter, createBrowserRouter, Navigate } from 'react-router';
import { MainLayout } from './layouts/main-layout/MainLayout';

import { HomePage } from './pages/home/HomePage';
import { KnowledgePage } from './pages/knowledge/KnowledgePage';
import { FilePage } from './pages/file/FilePage';
import { AssistantPage } from './pages/assistant/AssistantPage';
import { SettingPage } from './pages/settings/SettingPage';
import { McpPage } from './pages/mcp/McpPage';
export const router = createHashRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: 'home',
        element: (
          <React.Suspense>
            <HomePage />
          </React.Suspense>
        ),
      },
      {
        path: 'knowledge',
        element: <KnowledgePage />,
      },
      {
        path: 'file',
        element: <FilePage />,
      },
      {
        path: 'assistant',
        element: <AssistantPage />,
      },
      {
        path: 'mcp',
        element: <McpPage />,
      },
      {
        path: 'settings',
        element: <SettingPage />,
      },
    ],
  },
]);
