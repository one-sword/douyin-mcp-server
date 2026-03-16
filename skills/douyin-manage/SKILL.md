---
name: douyin-manage
description: 管理抖音登录状态，包括检查登录、查看 Cookie 信息、清除登录数据。当用户需要检查抖音登录状态、退出登录、清理缓存时使用。
license: MIT
compatibility: Node.js 18+
allowed-tools: Bash(node *) Bash(npx *)
---

# 抖音账号管理

管理抖音登录状态和凭证，提供检查、查看和清除功能。

## 功能列表

### 1. 检查登录状态

验证当前保存的 Cookie 是否有效：

```bash
npx tsx scripts/manage.ts check
```

输出示例：
```
✅ Cookies are valid. Can auto-login as: 用户昵称
```

或：
```
❌ Cookies are invalid or expired. Please login again.
```

### 2. 查看 Cookie 信息

查看已保存的 Cookie 基本信息（不显示敏感内容）：

```bash
npx tsx scripts/manage.ts info
```

输出示例：
```
Cookies found:
- Count: 25
- Created: 2024/1/15 10:30:00
```

或：
```
No saved cookies found.
```

### 3. 清除登录数据

清除所有保存的登录凭证和浏览器缓存：

```bash
npx tsx scripts/manage.ts clear
```

输出示例：
```
✅ Cookies and browser data cleared successfully.
```

## 参数说明

| 命令 | 说明 |
|-----|------|
| `check` | 验证 Cookie 有效性（会启动浏览器测试） |
| `info` | 查看 Cookie 文件信息（不启动浏览器） |
| `clear` | 清除所有登录数据和浏览器缓存 |

## 检查命令选项

```bash
npx tsx scripts/manage.ts check [--headless]
```

| 参数 | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| `--headless` | boolean | true | 是否使用无头模式 |

## 数据存储位置

- Cookie 文件：`douyin-cookies.json`
- 浏览器缓存：`chrome-user-data/`

## 使用场景

### 上传前检查

在上传视频前，建议先检查登录状态：

```bash
npx tsx scripts/manage.ts check && npx tsx scripts/upload.ts --video "..." --title "..."
```

### 切换账号

如需切换抖音账号：

```bash
# 1. 清除当前登录
npx tsx scripts/manage.ts clear

# 2. 重新登录新账号
npx tsx scripts/login.ts
```

### 定期维护

建议每周检查一次登录状态，避免上传时才发现 Cookie 过期：

```bash
npx tsx scripts/manage.ts check
```

## 注意事项

- `check` 命令会启动浏览器验证，耗时约 10-15 秒
- `info` 命令只读取本地文件，速度很快
- `clear` 命令会删除所有数据，操作不可逆

## 常见问题

**Q: check 显示有效但上传失败？**
A: 可能是部分 Cookie 过期，建议清除后重新登录。

**Q: 如何备份登录状态？**
A: 复制 `douyin-cookies.json` 文件即可，但注意保护好该文件的安全性。
