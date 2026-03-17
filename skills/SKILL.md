---
name: douyin
description: 抖音视频上传工具。支持登录抖音账号、上传视频、管理登录状态。当用户需要上传视频到抖音、登录抖音、检查抖音登录状态时使用。
version: 2.0.0
allowed-tools: Bash(node *) Bash(npx *) Bash(cd *) Bash(git clone *)
metadata:
  openclaw:
    requires:
      bins:
        - node
        - npm
        - npx
        - git
      anyBins:
        - chromium
        - google-chrome
        - chrome
    install:
      - kind: node
        package: tsx
        bins: [tsx]
    homepage: https://github.com/lancelin111/douyin-mcp-server
    emoji: "\U0001F3AC"
    os:
      - macos
      - linux
      - windows
---

# 抖音视频上传工具

自动化上传视频到抖音创作者平台，支持登录、上传和账号管理。

**源代码仓库**: https://github.com/lancelin111/douyin-mcp-server

## 安装

首次使用需要先克隆项目并安装依赖：

```bash
# 克隆源代码（{baseDir} 即为克隆后的目录）
git clone https://github.com/lancelin111/douyin-mcp-server.git {baseDir}

# 安装依赖并构建
cd {baseDir} && npm install && cd mcp-server && npm install && npm run build
```

> **安全提示**: 建议在安装前审查 [package.json](https://github.com/lancelin111/douyin-mcp-server/blob/main/mcp-server/package.json) 和 [脚本源码](https://github.com/lancelin111/douyin-mcp-server/tree/main/scripts)。

## 功能一：登录抖音

登录抖音创作者平台，保存登录凭证（Cookie）。

```bash
cd {baseDir} && npx tsx scripts/login.ts
```

**流程：**
1. 自动打开浏览器窗口
2. 等待用户完成登录（扫码或账号密码）
3. 登录成功后自动保存 Cookie

**输出示例：**
```
✅ Login successful!
User: 用户昵称
Cookies saved: 25
```

## 功能二：上传视频

上传视频到抖音，支持设置标题、描述和标签。

```bash
cd {baseDir} && npx tsx scripts/upload.ts --video "视频路径" --title "视频标题"
```

**参数：**

| 参数 | 必需 | 说明 |
|-----|-----|------|
| `--video` | 是 | 视频文件绝对路径 |
| `--title` | 是 | 视频标题 |
| `--description` | 否 | 视频描述 |
| `--tags` | 否 | 标签，逗号分隔 |
| `--no-publish` | 否 | 仅保存草稿 |

**完整示例：**
```bash
cd {baseDir} && npx tsx scripts/upload.ts \
  --video "/Users/xxx/video.mp4" \
  --title "我的视频" \
  --description "视频描述" \
  --tags "日常,生活,记录"
```

**输出示例：**
```
✅ Video upload and publish successful!
Title: 我的视频
Status: Published
```

## 功能三：管理登录状态

检查、查看或清除登录数据。

### 检查登录是否有效
```bash
cd {baseDir} && npx tsx scripts/manage.ts check
```

### 查看 Cookie 信息
```bash
cd {baseDir} && npx tsx scripts/manage.ts info
```

### 清除登录数据
```bash
cd {baseDir} && npx tsx scripts/manage.ts clear
```

## 常见问题

**Q: 提示 "Login expired"？**
```bash
cd {baseDir} && npx tsx scripts/manage.ts clear
cd {baseDir} && npx tsx scripts/login.ts
```

**Q: 上传时遇到短信验证？**
程序会自动提示，按提示输入验证码即可。

**Q: Cookie 有效期多久？**
约 30 天，建议定期检查登录状态。
