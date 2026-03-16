---
name: douyin-login
description: 登录抖音创作者平台，保存登录凭证。当用户需要登录抖音、授权抖音账号、或提示需要先登录时使用此技能。
license: MIT
compatibility: 需要 Chrome/Chromium 浏览器，Node.js 18+
allowed-tools: Bash(node *) Bash(npx *)
---

# 抖音登录

登录抖音创作者平台并保存 Cookie 凭证，用于后续的视频上传等操作。

## 使用方法

在项目根目录运行：

```bash
npx tsx scripts/login.ts
```

或者使用编译后的版本：

```bash
node scripts/dist/login.js
```

## 参数说明

| 参数 | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| `--headless` | boolean | false | 是否使用无头模式（登录时建议关闭） |
| `--timeout` | number | 180000 | 登录超时时间（毫秒） |

## 工作流程

1. 启动 Chrome 浏览器窗口
2. 打开抖音创作者平台登录页面
3. 等待用户完成登录（扫码或账号密码）
4. 检测登录成功后自动保存 Cookie
5. 返回登录状态和用户信息

## 输出示例

登录成功：
```
✅ Login successful!
User: 用户昵称
Cookies saved: 25
```

登录失败：
```
❌ Login failed: Login timeout
```

## 注意事项

- 首次使用必须手动登录，不支持无头模式
- Cookie 保存在 `douyin-cookies.json` 文件中
- Cookie 有效期约 30 天，过期后需重新登录
- 建议定期使用 `douyin-manage` 技能检查登录状态

## 常见问题

**Q: 浏览器窗口闪退？**
A: 确保已安装 Chrome 或 Chromium 浏览器。

**Q: 登录超时？**
A: 可以通过 `--timeout` 参数延长超时时间。

**Q: 如何查看当前登录状态？**
A: 使用 `/douyin-manage` 技能的检查功能。
