# 抖音视频/图文上传与互动 Skills

让你的 AI 助手能够自动登录抖音、上传视频、上传图文，并对指定抖音内容执行点赞和收藏。支持 [OpenClaw](https://openclaw.ai)、[Claude Code](https://claude.ai/code) 等 AI 工具。

---

## 目录

- [快速开始](#快速开始)
- [详细使用流程](#详细使用流程)
  - [第一步：登录抖音账号](#第一步登录抖音账号)
  - [第二步：上传视频](#第二步上传视频)
  - [第三步：上传图文](#第三步上传图文)
  - [第四步：点赞和收藏指定内容](#第四步点赞和收藏指定内容)
  - [第五步：管理登录状态](#第五步管理登录状态)
- [Skills 说明](#skills-说明)
- [命令行使用](#命令行使用)
- [常见问题](#常见问题)

---

## 快速开始

### 前置要求

- **Node.js 18+**
- **Chrome / Chromium 浏览器**
- **抖音创作者账号**

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/one-sword/douyin-mcp-server.git
cd douyin-mcp-server

# 2. 安装依赖并构建
npm install
cd mcp-server && npm install && npm run build && cd ..
cd skills/douyin && npm install && cd ../..

# 3. 按需复制 Skill 到你的工具目录
# OpenClaw:
mkdir -p ~/.openclaw/workspace/skills/douyin && cp skills/douyin/SKILL.md ~/.openclaw/workspace/skills/douyin/

# Claude Code:
mkdir -p ~/.claude/skills/douyin && cp skills/douyin/SKILL.md ~/.claude/skills/douyin/
```

### 验证安装

```bash
cd skills/douyin
npm run manage -- info
```

如果输出 `No saved cookies found.`，说明脚本已经可以正常运行。

---

## 详细使用流程

### 第一步：登录抖音账号

首次使用前，必须先登录抖音并保存 Cookie。

**在 OpenClaw / Claude Code 中：**

```text
帮我登录抖音
```

或：

```text
/douyin
```

**命令行方式：**

```bash
cd skills/douyin
npm run login
```

**参数说明：**

| 参数 | 必需 | 说明 |
|-----|-----|------|
| `--headless` | 否 | 无头模式；不传时默认有头 |

**流程说明：**

1. 程序会自动打开浏览器
2. 浏览器进入抖音创作者平台登录页
3. 你手动完成扫码或账号密码登录
4. 登录成功后，程序自动保存 Cookie
5. 终端显示登录成功信息

> 注意：Cookie 一般有有效期，过期后需要重新登录。

> 重要提示：首次发布视频或图文时，平台可能要求短信验证。按提示输入验证码即可。

---

### 第二步：上传视频

登录成功后，就可以上传视频。

**在 OpenClaw / Claude Code 中：**

```text
上传视频 /Users/xxx/video.mp4 到抖音，标题是“我的第一个视频”，标签是“日常,生活”
```

**命令行方式：**

```bash
cd skills/douyin
npm run upload -- --type video --video "/Users/xxx/video.mp4" --title "我的第一个视频" --description "这是视频描述" --tags "日常,生活,记录"
```

**常用参数：**

| 参数 | 必需 | 说明 |
|-----|-----|------|
| `--type video` | 是 | 指定视频模式 |
| `--video` | 是 | 视频文件绝对路径 |
| `--title` | 是 | 视频标题 |
| `--description` | 否 | 视频描述 |
| `--tags` | 否 | 标签，逗号分隔 |
| `--headless` | 否 | 无头模式；不传时默认有头 |
| `--no-publish` | 否 | 仅保存草稿，不直接发布 |

---

### 第三步：上传图文

除了视频，也支持上传图文作品。

**在 OpenClaw / Claude Code 中：**

```text
上传图文到抖音，图片是 /Users/xxx/photo1.jpg 和 /Users/xxx/photo2.jpg，描述是“今天的风景真美”，标签是“风景,摄影”
```

**命令行方式：**

```bash
cd skills/douyin
npm run upload -- --type image --image "/Users/xxx/photo1.jpg" --image "/Users/xxx/photo2.jpg" --description "今天的风景真美" --tags "风景,摄影"
```

**常用参数：**

| 参数 | 必需 | 说明 |
|-----|-----|------|
| `--type image` | 是 | 指定图文模式 |
| `--images`, `-i` | 否 | 多张图片路径，逗号分隔 |
| `--image` | 否 | 单张图片路径，可重复传入 |
| `--description` | 是 | 图文描述 |
| `--title` | 否 | 图文标题 |
| `--tags` | 否 | 话题标签，逗号分隔 |
| `--music`, `-m` | 否 | 背景音乐搜索关键词 |
| `--headless` | 否 | 无头模式；不传时默认有头 |
| `--no-publish` | 否 | 仅保存草稿 |

**图片限制：**

- 支持 `jpg`、`jpeg`、`png`、`webp`
- 单次最少 1 张，最多 35 张

> 提示：背景音乐通过关键词搜索匹配。如果搜索不到结果，会跳过音乐选择，不影响继续发布。

---

### 第四步：点赞和收藏指定内容

这是新增能力。你可以让工具直接打开指定的抖音短链接，并对该内容执行“点赞 + 收藏”。

**支持的链接格式示例：**

- `https://v.douyin.com/NDxCxSATlMA/`
- `https://v.douyin.com/nqKs1FI5CAo/`
- `https://v.douyin.com/_i9pQaZWVuk/`

**在 OpenClaw / Claude Code 中：**

```text
帮我给这个抖音内容点赞并收藏：https://v.douyin.com/NDxCxSATlMA/
```

**命令行方式：**

```bash
cd skills/douyin
npm run engage -- --url "https://v.douyin.com/NDxCxSATlMA/"
```

或者：

```bash
cd skills/douyin
npm run engage -- -u "https://v.douyin.com/nqKs1FI5CAo/" --headless
```

**参数说明：**

| 参数 | 必需 | 说明 |
|-----|-----|------|
| `--url`, `-u` | 是 | 抖音分享短链接 |
| `--headless` | 否 | 无头模式；不传时默认有头 |

**行为说明：**

- 只接受 `https://v.douyin.com/.../` 这种抖音分享短链接
- 会先解析短链接，再进入最终内容页执行动作
- 目标是确保最终状态为“已点赞 + 已收藏”
- 如果内容本来就已经点赞或收藏，不会重复点击把状态反过来
- 同时支持视频内容页和图文内容页
- 默认使用有头模式，只有显式传 `--headless` 时才使用无头模式
- 传 `--headless` 后不会弹出浏览器窗口，更适合 MCP、远程环境或纯自动执行
- 如果你要排查页面是否真的完成了点击，优先不要传 `--headless`

**MCP 调用方式：**

如果你是通过 MCP 客户端调用，工具名是 `douyin_like_and_favorite`，调用示例：

```json
{
  "name": "douyin_like_and_favorite",
  "arguments": {
    "url": "https://v.douyin.com/NDxCxSATlMA/",
    "headless": false
  }
}
```

---

### 第五步：管理登录状态

建议定期检查登录状态，避免执行上传或互动时才发现 Cookie 已失效。

**检查登录是否有效：**

```bash
cd skills/douyin
npm run manage -- check
```

**查看 Cookie 信息：**

```bash
cd skills/douyin
npm run manage -- info
```

**清除登录数据：**

```bash
cd skills/douyin
npm run manage -- clear
```

---

## Skills 说明

本项目提供一个统一的 `douyin` Skill，适合在支持 Skills 的 AI 工具中直接调用。

**Skill 名称：** `douyin`

**典型触发方式：**

- “帮我登录抖音”
- “上传视频到抖音”
- “上传图文到抖音”
- “帮我给这个抖音链接点赞并收藏”
- “检查抖音登录状态”

**支持能力：**

- 登录抖音并保存 Cookie
- 上传视频到抖音
- 上传图文到抖音
- 对指定抖音内容点赞并收藏
- 检查、查看、清除登录状态

---

## 命令行使用

### 登录

```bash
cd skills/douyin
npm run login
```

### 上传

```bash
cd skills/douyin
npm run upload -- --type video --video <路径> --title <标题> [选项]
npm run upload -- --type image --images <路径1,路径2,...> --description <描述> [选项]
```

### 点赞和收藏

```bash
cd skills/douyin
npm run engage -- --url <抖音短链接>
```

### 管理

```bash
cd skills/douyin
npm run manage -- <check|info|clear>
```

---

## 常见问题

### Q: 提示 “Login expired” 怎么办？

Cookie 已失效，重新登录即可：

```bash
cd skills/douyin
npm run manage -- clear
npm run login
```

### Q: 上传时卡住不动怎么办？

1. 检查网络
2. 大文件上传本身会比较慢
3. 不要使用 `--headless`，先观察浏览器页面发生了什么

### Q: `--headless` 参数到底什么时候用？

- 所有脚本默认都是有头模式，也就是会打开浏览器窗口
- 只有显式传 `--headless` 时，才会改成无头模式
- 适合传 `--headless` 的场景：MCP 调用、远程服务器、自动化批处理、你不需要人工观察页面
- 不适合传 `--headless` 的场景：登录时需要扫码、首次排查上传/互动失败、你想确认页面到底停在哪一步

### Q: 图文支持哪些图片格式？

- `jpg`
- `jpeg`
- `png`
- `webp`
- 单次最多 35 张

### Q: 图文背景音乐搜索不到怎么办？

背景音乐是可选功能。搜索不到时会跳过，不影响发布流程。

### Q: 点赞和收藏支持什么链接？

目前只支持抖音分享短链接，也就是 `https://v.douyin.com/.../` 这种格式。

### Q: 点赞和收藏会不会把已点赞内容取消掉？

不会。当前逻辑是确保最终状态为“已点赞、已收藏”，如果已经完成，就不会重复点击。

### Q: 支持只点赞不收藏吗？

当前不支持。现在的互动能力是固定执行“点赞 + 收藏”组合动作。

---

## 项目结构

```text
douyin-mcp-server/
├── skills/
│   └── douyin/
│       ├── SKILL.md
│       ├── douyin-uploader.js
│       └── scripts/
│           ├── login.js
│           ├── upload.js
│           ├── manage.js
│           └── engage.js
├── mcp-server/
│   ├── douyin-uploader.ts
│   ├── index.ts
│   └── __tests__/
├── scripts/
├── openspec/
├── README.md
└── CLAUDE.md
```

---

## 注意事项

1. 请妥善保管本地 Cookie 文件
2. 请遵守抖音平台规则，不要进行违规操作
3. 点赞和收藏功能依赖当前页面结构，抖音页面大改版后可能需要更新选择器逻辑

---

## License

MIT
