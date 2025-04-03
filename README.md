<div align="center">

<h1>Welcome to Evo Chat 👋</h1>

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


Evo Chat (Evolution Chat) is a modern open-source AI conversation platform, dedicated to creating the most elegant interface for large language models. It supports integration with mainstream LLM providers like ChatGPT, Deepseak, and others, while continuously evolving through knowledge base enhancement, multimodal processing, MCP (Model Control Protocol), and other extensible capabilities. Supporting cross-platform deployment (Web, App, Windows, Mac, Linux), it provides ubiquitous AI capabilities for users.

## 🖼️ Interface Preview

## ✨ Features

- [x] 💬 Intelligent Conversation
  - [x] Support for multiple model integration with flexible dialogue capabilities
  - [x] Context-aware conversations maintaining coherence
  - [x] Knowledge base Q&A for quick information retrieval

- [x] 🚀 Knowledge Base Management
  - [x] Create, edit, and delete knowledge bases for efficient organization
  - [x] Document vectorization for enhanced retrieval efficiency
  - [x] Vector search for quick content location

- [x] 📁 File Management
  - [x] File upload, preview, and deletion for simplified operations
  - [x] File category management for easy classification
  - [x] Batch operations for improved efficiency

- [x] 💻 Cross-Platform Support
  - [x] Web access for anywhere, anytime use
  - [x] Desktop client (Windows, Mac, Linux)
  - [x] Mobile app for smooth mobile experience

- [x] 🤖 AI Assistants
  - [x] Pre-configured professional domain assistants (programming, writing, translation, etc.)
  - [x] Customizable assistant roles and domains
  - [x] Independent knowledge base management for assistants
  - [x] Quick switching between different assistant scenarios

- [ ] 🔮 Advanced Features
  - [ ] MCP (Model Control Protocol) support

## 📁 Project Structure

```bash
.
├── packages
│   ├── b-component            # Business component library
│   ├── data-store             # Data management
│   ├── knowledge-service      # Knowledge service (electron-app only)
│   ├── pglite-manager         # PGlite local database manager
│   ├── platform-bridge        # Cross-platform capabilities (file I/O, database, etc.)
│   ├── types                  # Global type definitions
│   └── utils                  # Common utilities
├── projects
│   ├── electron-app           # Desktop client
│   ├── h5                     # Mobile application
│   └── web                    # Web application
├── scripts
│   ├── build                 # Build scripts
│   └── utils                 # Utility scripts
└── docs                      # Project documentation

## 📦 Development

### Requirements

- Node.js >= 20.18.3
- pnpm >= 9.15.5

### Getting Started

```bash
# Clone the repository
git clone https://github.com/your-repo/evo-chat.git

# Enter project directory
cd evo-chat

# Install dependencies
pnpm install

# Install workspace dependencies
npm run bootstrap