---
name: douyin-upload
description: 上传视频到抖音创作者平台。当用户需要发布视频、上传内容到抖音、分享视频到抖音时使用此技能。
license: MIT
compatibility: 需要先完成抖音登录（使用 douyin-login 技能），视频文件必须存在
allowed-tools: Bash(node *) Bash(npx *) Bash(cd *)
---

# 抖音视频上传

上传视频到抖音创作者平台，支持设置标题、描述和标签。

## 前置条件

必须先使用 `/douyin-login` 完成登录。

## 执行命令

```bash
cd {baseDir}/../../ && npx tsx scripts/upload.ts --video "视频路径" --title "视频标题"
```

## 完整参数

| 参数 | 必需 | 说明 |
|-----|-----|------|
| `--video` | 是 | 视频文件绝对路径 |
| `--title` | 是 | 视频标题 |
| `--description` | 否 | 视频描述 |
| `--tags` | 否 | 标签，逗号分隔 |
| `--no-publish` | 否 | 仅保存草稿 |

## 示例

上传视频并发布：
```bash
cd {baseDir}/../../ && npx tsx scripts/upload.ts --video "/Users/xxx/video.mp4" --title "我的视频" --tags "日常,生活"
```

仅保存草稿：
```bash
cd {baseDir}/../../ && npx tsx scripts/upload.ts --video "/Users/xxx/video.mp4" --title "我的视频" --no-publish
```

## 输出示例

```
✅ Video upload and publish successful!
Title: 我的视频
Status: Published
```

## 注意事项

- 视频路径必须是绝对路径
- 大文件上传需要较长时间
- 遇到短信验证时按提示输入验证码
