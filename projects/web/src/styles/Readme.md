# CSS 变量使用文档

## 颜色变量

### 文本颜色

- `--evo-color-text`: 主要文本色
- `--evo-color-text-secondary`: 次要文本色
- `--evo-color-text-tertiary`: 第三级文本色
- `--evo-color-text-quaternary`: 第四级文本色
- `--evo-color-text-disabled`: 禁用颜色

### 背景颜色

- `--evo-color-bg-layout`: 布局背景色(灰色)
- `--evo-color-bg-container`: 容器背景色(白色)

### 填充颜色

- `--evo-color-fill`: 主要填充色 (rgba(0, 0, 0, 0.15))
- `--evo-color-fill-secondary`: 次要填充色 (rgba(0, 0, 0, 0.06))
- `--evo-color-fill-tertiary`: 第三级填充色 (rgba(0, 0, 0, 0.04))
- `--evo-color-fill-quaternary`: 第四级填充色 (rgba(0, 0, 0, 0.02))

<!--
### 边框颜色
- `--evo-color-border`: 基础边框色
- `--evo-color-border-secondary`: 次要边框色

### 主题色

- `--evo-color-primary`: 主题色
- `--evo-color-primary-bg`: 主题色背景
- `--evo-color-primary-hover`: 主题色悬浮状态
- `--evo-color-primary-active`: 主题色激活状态
- `--evo-color-primary-outline`: 主题色轮廓 -->

## 使用示例

```scss
.example {
  // 使用主题色
  color: var(--evo-color-primary);

  // 使用间距
  padding: var(--evo-spacing-md);

  // 使用圆角
  border-radius: var(--evo-radius-md);

  // 使用阴影
  box-shadow: var(--evo-shadow-md);

  // 使用字号
  font-size: var(--evo-font-size-md);
}
```
