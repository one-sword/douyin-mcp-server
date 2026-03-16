---
name: douyin-upload
description: 上传视频到抖音创作者平台。当用户需要发布视频、上传内容到抖音、分享视频到抖音时使用此技能。
license: MIT
compatibility: 需要先完成抖音登录（使用 douyin-login 技能），视频文件必须存在且格式正确
allowed-tools: Bash(node *) Bash(npx *)
---

# 抖音视频上传

上传视频到抖音创作者平台，支持设置标题、描述和标签。

## 前置条件

必须先使用 `douyin-login` 技能完成登录，确保 Cookie 有效。

## 使用方法

```bash
npx tsx scripts/upload.ts --video "/path/to/video.mp4" --title "视频标题"
```

或使用编译后的版本：

```bash
node scripts/dist/upload.js --video "/path/to/video.mp4" --title "视频标题"
```

## 参数说明

| 参数 | 类型 | 必需 | 说明 |
|-----|------|-----|------|
| `--video` | string | 是 | 视频文件的绝对路径 |
| `--title` | string | 是 | 视频标题（建议 10-30 字） |
| `--description` | string | 否 | 视频描述 |
| `--tags` | string | 否 | 标签，逗号分隔（如 "搞笑,日常,生活"） |
| `--headless` | boolean | 否 | 是否使用无头模式（默认 false） |
| `--no-publish` | boolean | 否 | 仅保存草稿，不自动发布 |

## 完整示例

```bash
npx tsx scripts/upload.ts \
  --video "/Users/me/videos/test.mp4" \
  --title "我的第一个视频" \
  --description "这是视频描述" \
  --tags "测试,抖音,视频"
```

## 工作流程

1. 验证视频文件存在且可读
2. 加载已保存的登录 Cookie
3. 打开抖音上传页面
4. 上传视频文件（等待时间取决于文件大小）
5. 填写标题、描述和标签
6. 点击发布按钮（或保存草稿）
7. 处理可能出现的短信验证
8. 返回上传结果

## 输出示例

上传成功：
```
✅ Video upload and publish successful!
Title: 我的第一个视频
Status: Published
```

上传失败：
```
❌ Upload failed: Login expired. Please login again.
```

## 支持的视频格式

- MP4（推荐）
- MOV
- AVI
- 分辨率：建议 1080x1920（竖屏）或 1920x1080（横屏）
- 时长：建议 15 秒 - 5 分钟
- 大小：建议不超过 500MB

## 注意事项

- 上传大文件时请耐心等待，程序会根据文件大小自动调整等待时间
- 如果遇到短信验证，程序会提示您输入验证码
- 发布后视频可能需要审核，状态为"审核中"属于正常情况

## 常见问题

**Q: 提示 "Login expired"？**
A: Cookie 已过期，请重新运行 `douyin-login` 技能登录。

**Q: 上传卡住不动？**
A: 大文件上传需要较长时间，请检查网络连接。可以使用 `--headless false` 观察浏览器状态。

**Q: 如何只保存草稿？**
A: 添加 `--no-publish` 参数。
