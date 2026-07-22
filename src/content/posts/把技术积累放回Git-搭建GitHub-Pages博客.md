---
author: "ycr97"
pubDatetime: 2026-07-22T00:00:00+08:00
title: "把技术积累放回 Git：基于 AstroPaper 搭建并持续发布我的 GitHub Pages 博客"
draft: true
tags: ["GitHub Pages", "Astro", "GitHub Actions", "个人博客"]
category: "工程实践"
description: "记录我如何基于 AstroPaper 搭建个人 GitHub Pages 技术博客，并通过 GitHub Actions、内容迁移和公开内容校验，把技术积累变成一条可持续发布的工程化流程。"
---

# 把技术积累放回 Git：基于 AstroPaper 搭建并持续发布我的 GitHub Pages 博客

这篇文章记录一次对我来说很实用的搭建过程：为了更好地记录技术学习和工作经验，我基于 AstroPaper 搭建了一个自己的 GitHub Pages 技术博客，并把写作、构建、校验和部署串成了一条完整的发布流水线。

它不是一个后台管理系统，也没有数据库和复杂的服务端代码。文章以 Markdown 文件存在 Git 仓库中，修改文章就是修改代码，发布文章就是提交并推送一次变更。

最终形成的流程可以概括为：

```text
Markdown 文章
    │
    ▼
git push main
    │
    ▼
GitHub Actions
    │
    ├── 安装固定版本的 Node.js 和 pnpm
    ├── 安装依赖
    ├── 检查公开内容和敏感信息
    ├── 执行 ESLint 和 Astro 构建
    └── 生成 dist 构建产物
    │
    ▼
GitHub Pages
```

对程序员来说，这种方式的吸引力不只是“免费托管一个网页”，更重要的是把技术记录放回熟悉的工作方式中：版本管理、代码审查、自动化构建和持续发布。

## 一、为什么要搭建一个公开博客

技术学习和工作经验如果只停留在临时笔记、聊天记录或本地文件中，过一段时间之后很难重新检索和复用。写成公开文章，会迫使自己把问题的背景、解决过程和最终结论重新组织一遍。

因此，搭建这个博客最主要的原因很简单：记录技术学习和工作经验。

公开写作还有一个额外价值。文章不再只是某一次查询的结果，而是可以持续修改、补充和链接的长期资料。以后再次遇到类似问题时，可以直接回到文章和提交记录中查看当时的思路。

我希望这个博客具备几个特点：

- 内容以文本文件保存，迁移和备份都比较简单；
- 文章可以通过 Git 进行版本管理；
- 写作过程不依赖某个特定的后台管理系统；
- 提交代码后能够自动构建和部署；
- 文章和图片都能在发布前经过检查；
- 读者可以直接访问最终页面，其他开发者也可以查看项目结构。

## 二、为什么选择 GitHub Pages

我最终选择 GitHub Pages，主要不是因为它拥有最多的功能，而是因为它和程序员的日常工作方式比较贴合。

### 2.1 内容天然具备版本管理能力

博客文章本质上是 Markdown 文件。每次修改都有提交记录，文章的历史版本、修改时间和修改原因都可以被保留下来。

如果某次改动让文章变得更差，也可以通过 Git 找到之前的版本。对技术文章来说，这比一个只能保存最终结果的编辑器更适合长期维护。

### 2.2 写作和发布使用同一套工具

我平时已经在 GitHub 上管理代码和项目，因此使用 GitHub 管理博客并不会增加一套完全陌生的系统：

```text
本地编辑 Markdown
    ↓
git diff 检查改动
    ↓
本地构建和校验
    ↓
git commit
    ↓
git push
    ↓
GitHub Actions 自动部署
```

博客不再是一个和开发工作分离的“内容后台”，而是一个可以使用同样工具维护的公开项目。

### 2.3 静态博客足够简单

这个博客主要承载技术文章、代码片段、图片和项目记录，不需要用户登录、在线投稿、复杂的数据库查询或服务端业务逻辑。

静态站点的好处是部署链路短、运行成本低、故障面小。构建完成后，GitHub Pages 只需要托管生成的静态文件即可。

当然，GitHub Pages 也有边界：

- 不适合需要复杂后端逻辑的站点；
- 在线编辑能力不如传统博客后台；
- 动态评论、用户系统等能力需要额外的第三方服务；
- 发布依赖 Git 提交和构建流程，对不熟悉 Git 的读者有一定门槛。

对我当前的目标来说，这些限制是可以接受的。

## 三、从 AstroPaper 模板开始改造

这个博客不是从零手写主题，而是通过 create-astro 使用 satnaing/astro-paper 模板初始化，再逐步改造成符合自己需求的站点。

仓库中记录的主题来源信息如下：

- 上游项目：[satnaing/astro-paper](https://github.com/satnaing/astro-paper)
- 导入版本：6.1.0
- 初始化方式：create-astro
- 导入时间：2026-07-19

使用现成模板的意义，不是完全不做设计，而是先把文章列表、文章详情、标签、归档、RSS 和响应式布局等通用能力搭起来，再把时间放在内容和发布流程上。

### 3.1 站点基础配置

站点的核心配置位于 astro.config.ts：

```ts
export default defineConfig({
  site: "https://ycr97.github.io",
  base: "/personal-blog",
  integrations: [mdx(), sitemap()],
});
```

这里有两个配置尤其重要：

- site：站点的主域名；
- base：项目站点部署在 GitHub Pages 子路径下时使用的路径前缀。

我的博客不是部署在域名根路径，而是部署在：

```text
https://ycr97.github.io/personal-blog/
```

所以 base 必须配置为 /personal-blog。这个配置会影响页面链接、资源链接、图片路径和 Sitemap。如果忽略它，首页可能能打开，但 CSS、JavaScript 或文章内部链接可能出现 404。

### 3.2 在模板之上的改造

当前站点在模板基础上主要做了这些调整：

| 方向     | 当前实现                                              |
| -------- | ----------------------------------------------------- |
| 站点信息 | 配置站点标题、作者、中文描述和 GitHub 主页            |
| 内容模型 | 为文章定义标题、摘要、发布时间、标签、分类和草稿字段  |
| Markdown | 支持 Markdown/MDX、目录、折叠内容、Callout 和代码高亮 |
| 站点功能 | 支持暗色模式、归档、RSS、Sitemap、动态 OG 图片        |
| 搜索     | 使用 Pagefind 生成静态全文搜索索引                    |
| 编辑入口 | 文章页面提供指向 GitHub 文件的编辑链接                |
| 质量控制 | 在公开发布前执行敏感信息和媒体元数据检查              |

这些功能有一个共同点：它们尽量在构建阶段完成，线上不需要额外运行一个后台服务。

## 四、博客文章是如何组织的

正式文章位于 src/content/posts/ 目录下。每篇文章都是一个 Markdown 文件，文件名会参与生成文章 URL。

一篇文章的基本 Frontmatter 大致如下：

```yaml
---
author: "ycr97"
pubDatetime: 2026-07-22T00:00:00+08:00
title: "文章标题"
draft: true
tags: ["Astro", "GitHub Pages"]
category: "工程实践"
description: "用于列表、SEO 和社交分享的文章摘要。"
---
```

写作阶段通常先保持 draft: true。文章内容、图片和公开性检查完成之后，再改为 false。

文章正文可以直接使用标题、列表、表格和代码块：

````markdown
## 一个小节

这里是正文。

```java
public class Example {
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}
```
````

### 4.1 图片如何管理

迁移 CSDN 和语雀文章时，我没有继续依赖第三方图片链接，而是把图片下载到博客仓库本地。

普通文章的图片可以放在：

```text
public/images/<article-slug>/image-name.png
```

Markdown 中使用包含站点 base 的公开路径：

```markdown
![图片说明](/personal-blog/images/<article-slug>/image-name.png)
```

这样做有几个好处：

- 第三方图片链接失效不会影响文章；
- 图片和文章可以一起版本管理；
- 构建和发布过程不依赖原平台；
- 可以在发布前检查图片元数据。

对于从 CSDN 迁移的文章，仓库沿用了 public/images/csdn/<article-id>/ 的目录结构，方便根据来源文章定位资源。

## 五、GitHub Actions 到底做了什么

刚开始接触 GitHub Actions 时，YAML 文件中的 workflow、job、step、runner 和 artifact 容易混在一起。把它们分别理解之后，部署流程就清晰多了。

### 5.1 几个核心概念

| 概念        | 含义                                               |
| ----------- | -------------------------------------------------- |
| Workflow    | 一份自动化流程配置，通常是 .github/workflows/*.yml |
| Event       | 触发条件，例如 push 或手动执行                     |
| Job         | 一组需要在同一个运行环境中执行的任务               |
| Step        | Job 中的具体步骤，可以执行命令或调用 Action        |
| Runner      | GitHub 提供的执行机器，例如 ubuntu-latest          |
| Artifact    | Job 产生并交给后续 Job 使用的构建产物              |
| Environment | GitHub 中用于部署权限和环境状态的配置              |
| permissions | 为 workflow 授予的最小权限集合                     |

当前博客的 workflow 由两个 Job 组成：

```text
build
  ├── 安装环境和依赖
  ├── 执行公开内容校验
  ├── 执行 lint
  ├── 构建 Astro 静态站点
  └── 上传 dist artifact

deploy
  ├── 等待 build 完成
  ├── 使用 github-pages 环境
  └── 部署 artifact
```

### 5.2 什么时候触发

workflow 使用两个触发入口：

```yaml
on:
  push:
    branches:
      - main
  workflow_dispatch:
```

这表示：

- 推送到 main 分支时自动执行；
- 也可以在 GitHub Actions 页面手动点击 Run workflow。

手动触发很有用。当我只想验证部署流程，或者需要重新发布相同源码时，不必为了触发 workflow 制造一个无意义的提交。

### 5.3 为什么需要 permissions

GitHub Actions 不应该默认拥有仓库的全部权限。当前 workflow 使用：

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

含义是：

- contents: read：允许 workflow 读取仓库代码；
- pages: write：允许上传和部署 GitHub Pages；
- id-token: write：允许 GitHub Pages 部署流程使用 OIDC 身份认证。

这里体现的是最小权限原则。构建只需要读取源代码，部署才需要 Pages 写权限。

### 5.4 为什么使用 concurrency

当前配置如下：

```yaml
concurrency:
  group: pages
  cancel-in-progress: true
```

如果短时间内连续推送多个提交，前一个构建还没有完成时，后一个构建可能已经代表更新的内容。cancel-in-progress: true 会取消旧的运行，避免多个部署任务同时竞争。

### 5.5 build Job

build Job 的职责是把源码变成经过检查的 dist 目录：

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0

      - name: Set up Node.js
        uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe502c
        with:
          node-version: "24"

      - name: Enable pnpm
        run: |
          corepack enable
          corepack prepare pnpm@9.15.9 --activate

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Validate and build
        run: pnpm check:all
```

这里有几个值得注意的点。

第一，Node.js 和 pnpm 版本是明确的。开发机和 CI 使用相同的主要运行时，可以减少“本地能构建、CI 不能构建”的情况。

第二，依赖安装使用 --frozen-lockfile。CI 不会修改 pnpm-lock.yaml，也不会悄悄重新解析依赖版本。锁文件和 package.json 不一致时，构建会直接失败，这比构建出一个不可复现的结果更容易排查。

第三，真正的质量门禁被集中到 pnpm check:all：

```json
{
  "scripts": {
    "validate:public": "./scripts/content/validate-public.sh",
    "lint": "eslint .",
    "build": "astro check && astro build && pagefind --site dist && cp -r dist/pagefind public/",
    "check:all": "pnpm validate:public && pnpm lint && pnpm build"
  }
}
```

也就是说，文章不是“写完就部署”，而是必须依次通过公开内容检查、Lint、Astro 类型检查、静态构建和 Pagefind 搜索索引生成。

### 5.6 为什么要上传 artifact

build Job 完成后，workflow 使用 configure-pages 和 upload-pages-artifact 把 dist 目录交给 Pages：

```yaml
- name: Configure Pages
  uses: actions/configure-pages@45bfe0192ca1faeb007ade9deae92b16b8254a0d

- name: Upload Pages artifact
  uses: actions/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9
  with:
    path: ./dist
```

dist 是 Astro 生成的静态站点，不是源码目录。把构建和部署分开，有两个好处：

- 部署 Job 不需要重新安装依赖和构建；
- deploy Job 使用的内容就是 build Job 已经验证过的产物。

### 5.7 deploy Job

deploy Job 依赖 build Job：

```yaml
deploy:
  environment:
    name: github-pages
    url: ${{ steps.deployment.outputs.page_url }}
  runs-on: ubuntu-latest
  needs: build
  steps:
    - name: Deploy Pages
      id: deployment
      uses: actions/deploy-pages@cd2ce8fcbc39b97be8ca5fce6e763baed58fa128
```

needs: build 表示只有 build 成功之后才允许部署。如果检查或构建失败，deploy Job 不会执行。

environment: github-pages 则把部署与 GitHub Pages 环境关联起来，GitHub 可以在这个环境中展示部署状态和最终页面地址。

### 5.8 为什么固定 Action 的 commit SHA

workflow 中没有直接使用 actions/checkout@v4 这样的可变标签，而是使用具体的 commit SHA。

标签可能在未来指向新的提交，而 commit SHA 是固定的。对于公开部署流水线来说，这能减少第三方 Action 无意变化带来的风险，也让历史构建更容易复现。

## 六、GitHub Pages 配置中容易忽略的地方

### 6.1 Pages 的部署来源

GitHub 仓库的 Pages 设置需要选择 GitHub Actions 作为部署来源，而不是从某个分支的根目录或 docs 目录直接发布。

原因是这个项目不是把源码直接当作网站，而是先由 Astro 生成 dist，再把 dist 作为 Pages artifact 部署。

### 6.2 base 路径

项目站点的 URL 是：

```text
https://ycr97.github.io/personal-blog/
```

所以 Astro 配置使用：

```ts
site: "https://ycr97.github.io",
base: "/personal-blog",
```

如果以后迁移到独立域名，site 和 base 都需要重新检查，文章图片、导航、Sitemap 和 RSS 也要一起验证。

### 6.3 本地先构建，再推送

在本地可以先运行：

```shell
corepack enable
corepack prepare pnpm@9.15.9 --activate
pnpm install --frozen-lockfile
pnpm format:check
pnpm check:all
```

其中 format:check 是本地格式检查，check:all 是仓库当前 CI 使用的主要质量门禁。

## 七、CSDN 和语雀文章迁移

博客搭好之后，下一步不是重新从零积累内容，而是把已有的技术文章迁移过来。

迁移 CSDN 和语雀文章时，我采用了比较直接的流程：

1. 整理文章标题、正文、代码块和表格；
2. 把文章中的图片下载到仓库本地；
3. 将图片放到约定的 public/images 目录；
4. 修改 Markdown 中的图片路径；
5. 补齐 Frontmatter、标签、分类和摘要；
6. 在本地运行构建和公开内容校验；
7. 确认生成的文章页面正常后，再提交发布。

图片本地化是迁移中的一个重要决定。文章不再依赖 CSDN 或语雀的图片服务，原平台链接变化不会直接破坏博客内容。

对 CSDN 文章，仓库使用了类似下面的目录：

```text
public/images/csdn/<article-id>/image.png
```

普通新文章则可以按文章 slug 组织：

```text
public/images/<article-slug>/image.png
```

迁移过程本身并没有遇到特别复杂的故障，主要工作是把原平台的内容结构整理成博客自己的 Markdown 和资源目录结构。

## 八、公开博客为什么还要做安全校验

公开博客仓库和普通个人仓库不同。提交到仓库的内容不仅会被自己看到，还可能被搜索引擎、构建服务和其他访问者长期保存。

因此，仓库增加了 scripts/content/validate-public.sh，用于在发布前检查公开内容。

目前主要检查几类问题：

- 使用 Gitleaks 扫描工作区中的敏感信息；
- 检查私钥内容；
- 检查 vless 等不应出现在公开内容中的连接信息；
- 检查未经批准的 IP 地址；
- 检查图片中的 GPS 信息；
- 检查图片中的设备序列号等元数据。

本地运行：

```shell
pnpm validate:public
```

这个脚本并不是为了让发布流程变得复杂，而是把“这份内容是否适合公开”从个人记忆变成了可以重复执行的检查。

对我来说，一个更可靠的公开发布流程应该是：

```text
写文章
  ↓
检查文章和图片
  ↓
检查敏感信息
  ↓
本地构建
  ↓
提交并推送
  ↓
自动部署
```

## 九、当前的完整发布流程

现在新增或修改一篇文章，大致遵循下面的步骤：

```shell
# 1. 新建或修改文章
vim src/content/posts/example.md

# 2. 本地预览
pnpm dev

# 3. 检查格式
pnpm format:check

# 4. 检查公开内容
pnpm validate:public

# 5. 检查并构建
pnpm check:all

# 6. 查看改动
git status
git diff

# 7. 提交并触发 GitHub Actions
git add src/content/posts/example.md
git commit -m "docs: add example article"
git push origin main
```

推送之后，GitHub Actions 会重新执行构建和部署。文章是否上线，不再依赖手动登录某个后台点击发布，而是由提交记录和自动化流程共同决定。

## 十、这个方案的优点和限制

### 优点

- 内容以 Markdown 保存，迁移成本低；
- Git 提供完整的版本管理能力；
- GitHub Actions 自动完成构建和部署；
- GitHub Pages 不需要自己维护服务器；
- 图片可以和文章一起保存在仓库；
- 安全校验和构建检查可以自动执行；
- 文章的编辑入口和源码天然关联。

### 限制

- 需要熟悉 Git、Markdown 和基础 CI/CD 概念；
- 没有传统博客后台那种所见即所得编辑器；
- 评论、用户系统和动态数据需要额外服务；
- GitHub Pages、GitHub Actions 和仓库结构存在一定平台绑定；
- 大量图片和大型媒体文件会增加仓库体积。

这个方案更适合技术博客、项目文档和长期知识沉淀，不一定适合需要复杂交互或大量运营功能的网站。

## 十一、后续可以继续完善的方向

后续可以围绕内容质量和发布体验继续改进：

- 增加文章模板，统一标题、摘要、标签和分类；
- 为迁移文章补充来源和发布时间信息；
- 优化图片压缩和命名规则；
- 增加链接有效性检查；
- 增加文章目录和相关内容推荐；
- 评估评论系统或反馈入口；
- 如果访问量增加，再考虑独立域名和访问统计；
- 继续把常见的文章迁移和发布步骤脚本化。

## 结语

搭建这个博客的目的并不是制作一个复杂的网站，而是给技术学习和工作经验找一个长期、稳定、可持续维护的公开载体。

GitHub Pages 提供了静态托管能力，AstroPaper 提供了站点基础，Markdown 负责承载内容，GitHub Actions 负责自动构建和部署，而公开内容校验则负责在发布前增加一道边界。

最终真正有价值的不是某一个框架或某一份 YAML 文件，而是形成了一条自己能够理解、修改和持续使用的知识发布流程：

```text
把问题写下来
把经验整理好
把内容放进版本库
让自动化流程完成发布
```

这样，技术学习才不只是一次性的输入，也会逐渐变成可以复用和持续积累的公开资料。
