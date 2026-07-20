# YCR Tech Notes（personal-blog）

公开技术博客的源码仓库。站点基于 Astro 和 AstroPaper 构建，通过 GitHub Actions 自动部署到 GitHub Pages。

- 线上地址：<https://ycr97.github.io/personal-blog/>
- 仓库地址：<https://github.com/ycr97/personal-blog>
- 内容语言：中文
- 包管理器：pnpm 9.15.9
- Node.js：CI 使用 24，本地最低要求 22.12.0

## 三个仓库如何分工

| 仓库 | 可见性 | 用途 |
| --- | --- | --- |
| `personal-notes` | Private | 私人笔记、草稿、研究和项目资料 |
| `personal-blog` | Public | 已审查并明确允许公开的文章及博客站点源码 |
| `personal-infra` | Private | 基础设施文档、脱敏模板、加密凭据和灾难恢复工具 |

本仓库是公开发布的最后一站，不承担私人草稿或基础设施备份职责。

## 目录结构

```text
personal-blog/
├── README.md                         # 本说明文档
├── package.json                      # 依赖、Node/pnpm 约束和常用命令
├── pnpm-lock.yaml                    # 锁定依赖版本，必须随依赖变更提交
├── astro.config.ts                   # Astro、站点 base、Markdown 和构建配置
├── astro-paper.config.ts             # 站点标题、作者、分页、搜索、社交链接等
├── src/
│   ├── content/
│   │   ├── posts/                    # 正式博客文章，支持 Markdown/MDX
│   │   └── pages/                    # About 等独立内容页
│   ├── content.config.ts             # 内容集合与文章 Frontmatter 结构定义
│   ├── pages/                        # 页面路由、RSS、Sitemap、搜索和文章页面
│   ├── components/                   # 页面复用组件
│   ├── layouts/                      # 全局和文章布局
│   ├── styles/                       # 全局样式、主题和排版
│   ├── assets/                       # 由 Astro 构建管线处理的图标和资源
│   ├── i18n/                         # 中文界面文本和国际化支持
│   ├── scripts/                      # 浏览器端主题等脚本
│   ├── utils/                        # 文章排序、标签、Slug、路径等工具函数
│   └── types/                        # TypeScript 类型定义
├── public/
│   ├── images/                       # 原样发布的文章图片
│   │   └── csdn/<article-id>/        # CSDN 迁移文章的本地化图片
│   ├── default-og.jpg                # 默认社交分享图
│   └── favicon.svg                   # 网站图标
├── scripts/
│   ├── content/validate-public.sh    # 公开内容、IP 和媒体元数据检查
│   ├── security/scan-secrets.sh      # gitleaks 敏感信息扫描
│   └── migration/                    # CSDN 导入及迁移结果校验工具
├── tests/
│   ├── content/                      # 公开内容校验测试
│   └── security/                     # 敏感信息防护测试
├── docs/
│   ├── migrations/                   # 内容迁移记录
│   ├── publication-review/           # 文章发布前审查记录
│   ├── releases/                     # 发布记录
│   ├── action-pins.md                # GitHub Actions 固定版本说明
│   └── theme-origin.md               # AstroPaper 主题来源和改造说明
├── .github/workflows/deploy.yml      # main 分支自动构建并部署 GitHub Pages
└── LICENSE-AstroPaper                # 上游主题许可证
```

以下是本地生成目录，不是内容源，也不会提交到 Git：

- `node_modules/`：依赖安装目录；
- `.astro/`：Astro 类型和内容缓存；
- `dist/`：生产构建产物；
- `public/pagefind/`：构建时生成的全文搜索索引；
- `.playwright-cli/`：本地浏览器测试记录。

## 写作与图片

### 新建文章

在 `src/content/posts/` 创建 `.md` 或 `.mdx` 文件。基本 Frontmatter 示例：

```yaml
---
title: "文章标题"
description: "用于列表和 SEO 的文章摘要"
pubDatetime: 2026-07-19T12:00:00+08:00
tags:
  - Java
category: 工程实践
draft: true
---
```

主要字段由 `src/content.config.ts` 约束。写作阶段保持 `draft: true`；内容、图片和敏感信息检查完成后再改为 `false`。

### 添加图片

普通文章建议使用：

```text
public/images/<article-slug>/image-name.png
```

由于站点部署在 `/personal-blog` 子路径，Markdown 中的公开路径应包含该前缀：

```md
![图片说明](/personal-blog/images/<article-slug>/image-name.png)
```

CSDN 迁移文章沿用 `public/images/csdn/<article-id>/`。不要直接依赖 CSDN 等第三方热链。

### CSDN 迁移文章命名

CSDN 文章文件使用“规范化标题 + CSDN 文章 ID”，例如：

```text
面试题-109106259.md
Java-IO学习之IO模型-BIO-113928886.md
```

标题让仓库目录可读，末尾 ID 用于区分同名文章。公开 URL 由该文件名生成，因此重命名文章文件也会改变文章 URL。

## 本地开发

```sh
corepack enable
corepack prepare pnpm@9.15.9 --activate
pnpm install --frozen-lockfile
pnpm dev
```

常用命令：

```sh
pnpm dev              # 启动本地开发服务器
pnpm build            # 类型检查、生产构建并生成 Pagefind 索引
pnpm preview          # 本地预览 dist/
pnpm lint             # ESLint 检查
pnpm format:check     # 检查格式，不修改文件
pnpm validate:public  # 敏感信息、IP 字面量和媒体元数据检查
pnpm check:all        # 发布前完整验证：安全检查、lint、生产构建
pnpm verify:csdn      # 校验 CSDN 迁移文章和本地图片
```

发布前推荐执行：

```sh
pnpm check:all
```

## 发布流程

```text
推送到 main
    ↓
GitHub Actions 执行 pnpm check:all
    ↓
生成 dist/ 和 Pagefind 搜索索引
    ↓
部署到 GitHub Pages
```

工作流位于 `.github/workflows/deploy.yml`。只有验证和构建全部通过才会部署。

## 公开仓库安全边界

禁止提交：

- 密码、Token、Cookie、恢复码和私钥；
- 真实 Xray/VLESS/Clash/Shadowrocket 节点信息；
- 未批准公开的 IP 地址、账号信息或私人记录；
- 包含 GPS、设备序列号或敏感画面的图片。

私人源稿保留在 `personal-notes`；基础设施和加密恢复材料保留在 `personal-infra`。
