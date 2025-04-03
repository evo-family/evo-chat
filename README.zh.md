<div align="center">

<h1>欢迎使用 Evo Chat 👋</h1>

[English](./README.md) | [简体中文](./README.zh.md)

</div>

<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000" />
  <a href="http://101.42.26.70:3000/doc" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/evo-family/evo-chat/graphs/community" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/evo-family/evo-chat/master/LICENSE" target="_blank">
    <img alt="License: Apache 2.0" src="https://img.shields.io/badge/License-Apache%202.0-yellow.svg" />
  </a>
</p>

Evo Chat（Evolution Chat）是一个现代化的开源 AI 对话平台，致力于打造最优雅的大模型交互入口。它支持对接 ChatGPT，Deepseak， 等主流大语言模型（LLM）服务商，并在此基础上不断进化，识库增强、多模态处理、MCP（Model Control Protocol）等扩展能力，让 AI 能力更加丰富。支持全平台部署（Web、App、Windows、Mac、Linux），为用户提供无处不在的 AI 能力入口。

## 🖼️ 界面展示

## ✨ 功能特性

- [x] 💬 智能对话
  - [x] 支持多模型接入，提供灵活的对话能力
  - [x] 支持上下文对话，保持对话的连贯性
  - [x] 支持知识库问答，快速获取所需信息

- [x] 🚀 知识库管理
  - [x] 支持创建、编辑、删除知识库，方便知识的组织和管理
  - [x] 支持向量化文档，提升知识检索效率
  - [x] 支持向量搜索，快速定位相关内容

- [x] 📁 文件管理
  - [x] 支持文件上传、预览、删除，简化文件操作
  - [x] 支持文件分类管理，便于文件的归类和查找
  - [x] 支持批量操作，提高工作效率

- [x] 💻 全平台支持
  - [x] 支持 Web 在线访问，随时随地使用
  - [x] 支持桌面客户端（Windows、Mac、Linux）
  - [x] 支持移动端 App，提供流畅的移动体验

- [x] 🤖 智能助手
  - [x] 支持预设多个专业领域助手（编程、写作、翻译等）
  - [x] 自定义助手角色与专业领域
  - [x] 助手知识库独立管理
  - [x] 快速切换不同助手场景

- [ ] 🔮 进阶功能
  - [ ] MCP（Model Control Protocol）协议支持


## 📁 项目结构

```bash
.
├── packages
│   ├── b-component            # 公用业务组件库
│   ├── data-store             # 数据管理
│   ├── knowledge-service      # 知识库服务（仅在electron项目用）
│   ├── pglite-manager         # pglite pg本地数据库
│   ├── platform-bridge        # 跨平台通用能力，如文件读写、数据库等
│   ├── types                  # 全局类型定义
│   └── utils                  # 通用工具函数
├── projects
│   ├── electron-app           # 桌面客户端
│   ├── h5                     # 移动端应用
│   └── web                    # Web 端应用
├── scripts
│   ├── build                 # 构建相关脚本
│   └── utils                 # 工具脚本
└── docs                      # 项目文档
```

## 📦 开发

### 环境要求

- Node.js >= 20.18.3
- pnpm >= 9.15.5

### 项目启动

```bash
# 克隆项目
git clone https://github.com/your-repo/evo-chat.git

# 进入项目目录
cd evo-chat

# 安装项目依赖
pnpm install

# 安装工作区依赖
npm run bootstrap
```

## 👥 贡献指南

欢迎加入 Evo Chat 开源社区！无论是提交代码、报告问题还是改进文档，我们都非常感谢您的贡献。

### 参与贡献

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 贡献者

感谢以下贡献者的参与：

<a href="https://github.com/your-repo/evo-chat/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=your-repo/evo-chat" />
</a>

## 📄 开源协议

本项目采用 [Apache 2.0](LICENSE) 开源协议。
