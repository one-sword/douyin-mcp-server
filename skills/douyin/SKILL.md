---
name: douyin
description: "Douyin (TikTok China) uploader & automation tool for videos and image posts. Log in, upload videos, upload image posts, manage login sessions, and automate publishing to Douyin Creator Platform. 抖音视频/图文上传工具 | 自动化发布 | 创作者平台。Use when uploading video or image posts to Douyin, logging in to Douyin, or checking/clearing Douyin login status."
version: 2.3.0
allowed-tools: Bash(node *) Bash(npm *)
metadata:
  openclaw:
    requires:
      bins:
        - node
        - npm
      anyBins:
        - chromium
        - google-chrome
        - chrome
    install:
      - kind: node
        package: puppeteer
        bins: []
    homepage: https://github.com/lancelin111/douyin-mcp-server
    emoji: "\U0001F3AC"
    os:
      - macos
      - linux
      - windows
---

# Douyin Uploader | 抖音视频/图文上传工具

> **Douyin (TikTok China) upload automation** for videos and image posts from the command line or AI agents.
>
> 自动化发布抖音视频和图文作品，支持登录、上传和登录态管理。

**Keywords:** Douyin uploader, TikTok China, video upload, image post upload, social media automation, 抖音上传, 抖音图文, 抖音自动化, creator platform

**This skill is self-contained — all code is bundled, no external repo cloning needed.**
此 skill 为自包含结构，所有代码已打包在内，无需克隆外部仓库。

## Important | 重要提示

> **After logging in, the first publish may require SMS verification.** Enter the verification code when prompted. After the one-time verification, later publishes are usually fully automated.
>
> **登录成功后，首次发布视频或图文时可能需要短信验证。** 按提示输入验证码即可。完成一次验证后，后续发布通常可自动完成。

## Transparency Statement | 透明度声明

### Data Storage | 数据存储
- **Cookie file / Cookie 文件**: `{baseDir}/douyin-cookies.json` — Stores Douyin login credentials locally only (file permission: 0600) / 仅在本地保存抖音登录凭证（文件权限：0600）
- **Browser data / 浏览器数据**: `{baseDir}/chrome-user-data/` — Puppeteer browser session data

### Network Access | 网络访问
This tool only accesses official Douyin domains / 本工具仅访问以下抖音官方域名：
- `https://creator.douyin.com` — Douyin Creator Platform (login & upload) / 抖音创作者平台（登录、上传）
- `https://www.douyin.com` — Douyin main site (permission verification) / 抖音主站（权限验证）

**No third-party servers are accessed. Your credentials are never uploaded or leaked.**
不会访问任何第三方服务器，不会上传或泄露您的登录凭证。

### Code Behavior | 代码行为
1. **login.js**: Opens browser → waits for manual login → saves Cookie locally / 打开浏览器 → 等待手动登录 → 保存本地 Cookie
2. **upload.js**: Unified CLI entry. Uses `--type` as the only mode selector, then dispatches to video upload or image post upload / 统一上传入口。使用 `--type` 作为唯一模式来源，再分发到视频上传或图文上传
3. **manage.js**: Check, inspect, or clear local login data / 检查、查看或清除本地登录数据

### Dependencies | 依赖
- **puppeteer**: Browser automation (Chromium) / 浏览器自动化（Chromium）
- Full dependencies: see `package.json` in this directory / 完整依赖见本目录 `package.json`

## Installation | 安装

First-time setup — install dependencies / 首次使用先安装依赖：

```bash
cd {baseDir} && npm install
```

## Feature 1: Login to Douyin | 功能一：登录抖音

Login to Douyin Creator Platform and save credentials locally.
登录抖音创作者平台并保存本地登录凭证。

```bash
cd {baseDir} && node scripts/login.js
```

## Feature 2: Upload Content | 功能二：统一上传入口

Use one command for both video and image post uploads.
视频和图文共用一个上传命令入口。

### Video mode | 视频模式

Upload a video with title, description, and tags.
上传视频，支持标题、描述和标签。

```bash
cd {baseDir} && node scripts/upload.js --type video --video "视频路径" --title "视频标题"
```

**Parameters / 参数：**

| Parameter 参数 | Required 必需 | Description 说明 |
|-----|-----|------|
| `--video` | Yes 是 | Absolute path to video file / 视频文件绝对路径 |
| `--title` | Yes 是 | Video title / 视频标题 |
| `--description` | No 否 | Video description / 视频描述 |
| `--tags` | No 否 | Tags, comma-separated / 标签，逗号分隔 |
| `--no-publish` | No 否 | Save as draft only / 仅保存草稿 |

### Image post mode | 图文模式

Upload an image post with 1-35 images, required description, optional title/tags/music.
上传图文作品，支持 1-35 张图片，描述必填，标题/标签/背景音乐可选。

```bash
cd {baseDir} && node scripts/upload.js --type image --images "/path/a.jpg,/path/b.jpg" --description "今日随拍"
```

**Parameters / 参数：**

| Parameter 参数 | Required 必需 | Description 说明 |
|-----|-----|------|
| `--images`, `-i` | Yes 是 | Comma-separated image paths / 逗号分隔的图片路径 |
| `--image` | No 否 | Add one image path, repeatable / 单张图片路径，可重复传入 |
| `--description`, `-d` | Yes 是 | Post description / 图文描述 |
| `--title`, `-t` | No 否 | Post title / 图文标题 |
| `--tags` | No 否 | Topic tags, comma-separated / 话题标签，逗号分隔 |
| `--music`, `-m` | No 否 | Music search keyword / 背景音乐搜索关键词 |
| `--no-publish` | No 否 | Save as draft only / 仅保存草稿 |

**Image constraints / 图片限制：**
- Supports `jpg`, `jpeg`, `png`, `webp` / 支持 `jpg`、`jpeg`、`png`、`webp`
- Minimum 1 image, maximum 35 images / 最少 1 张，最多 35 张

**Example / 示例：**

```bash
cd {baseDir} && node scripts/upload.js \
  --type image \
  --image "/Users/xxx/a.jpg" \
  --image "/Users/xxx/b.jpg" \
  --description "今天的风景真美" \
  --title "今日风景" \
  --tags "风景,摄影" \
  --music "轻音乐"
```

**Rules / 规则：**
- `--type` is required and is the only source of mode selection / `--type` 为必填，且是唯一模式来源
- `--image` and `--images` currently mean image-post content, not video cover input / `--image` 和 `--images` 当前语义是图文正文图片，不是视频封面入参
- `--type video` cannot use `--image` or `--images` in the current CLI / 当前 CLI 下，`--type video` 不能使用 `--image` 或 `--images`
- `--type image` cannot be combined with `--video` / `--type image` 不能与 `--video` 一起使用
- `--music` is only valid for image posts / `--music` 仅用于图文模式
- Video mode requires `--title` / 视频模式必须提供 `--title`
- Image post mode requires `--description` / 图文模式必须提供 `--description`

## Feature 3: Manage Login Status | 功能三：管理登录状态

Check, inspect, or clear login data.
检查、查看或清除登录数据。

### Check if login is valid | 检查登录是否有效
```bash
cd {baseDir} && node scripts/manage.js check
```

### View Cookie info | 查看 Cookie 信息
```bash
cd {baseDir} && node scripts/manage.js info
```

### Clear login data | 清除登录数据
```bash
cd {baseDir} && node scripts/manage.js clear
```

## FAQ | 常见问题

**Q: "Login expired" error? / Q: 提示 "Login expired"？**
```bash
cd {baseDir} && node scripts/manage.js clear
cd {baseDir} && node scripts/login.js
```

**Q: SMS verification during publish? / Q: 发布时遇到短信验证？**
The program will prompt for the verification code automatically.
程序会自动提示输入验证码。

**Q: Which image formats are supported? / Q: 图文支持哪些图片格式？**
`jpg`, `jpeg`, `png`, `webp`, up to 35 images per post.
支持 `jpg`、`jpeg`、`png`、`webp`，单次最多 35 张图片。

**Q: What if music search fails? / Q: 背景音乐搜索失败怎么办？**
Music is optional. If no result is found, the publish flow continues without music.
背景音乐是可选项，搜索不到时会跳过，不影响继续发布。
