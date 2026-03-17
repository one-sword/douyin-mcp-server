---
name: douyin-login
description: 登录抖音创作者平台，保存登录凭证。当用户需要登录抖音、授权抖音账号、或提示需要先登录时使用此技能。
license: MIT
compatibility: 需要 Chrome/Chromium 浏览器，Node.js 18+
allowed-tools: Bash(node *) Bash(npx *) Bash(cd *)
---

# 抖音登录

登录抖音创作者平台并保存 Cookie 凭证，用于后续的视频上传等操作。

## 执行步骤

1. 首先进入项目目录并运行登录脚本：

```bash
cd {baseDir}/../../ && npx tsx scripts/login.ts
```

2. 浏览器窗口会自动打开，请在浏览器中完成登录（扫码或账号密码）

3. 登录成功后脚本会自动保存 Cookie 并退出

## 参数说明

| 参数 | 说明 |
|-----|------|
| `--headless` | 无头模式（登录时不要使用） |
| `--timeout 300000` | 延长超时时间到 5 分钟 |

## 输出示例

```
✅ Login successful!
User: 用户昵称
Cookies saved: 25
```

## 注意事项

- 首次登录必须显示浏览器窗口，不能使用 --headless
- Cookie 有效期约 30 天
- 登录凭证保存在项目目录的 `douyin-cookies.json`
