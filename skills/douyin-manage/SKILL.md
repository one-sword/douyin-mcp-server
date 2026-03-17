---
name: douyin-manage
description: 管理抖音登录状态。检查登录是否有效、查看 Cookie 信息、清除登录数据。当用户需要检查抖音状态、退出登录、清理缓存时使用。
license: MIT
compatibility: Node.js 18+
allowed-tools: Bash(node *) Bash(npx *) Bash(cd *)
---

# 抖音账号管理

管理抖音登录状态和凭证。

## 可用命令

### 检查登录状态

验证 Cookie 是否有效（会启动浏览器测试）：

```bash
cd {baseDir}/../../ && npx tsx scripts/manage.ts check
```

### 查看 Cookie 信息

查看本地保存的 Cookie 信息（不启动浏览器）：

```bash
cd {baseDir}/../../ && npx tsx scripts/manage.ts info
```

### 清除登录数据

清除所有登录凭证和浏览器缓存：

```bash
cd {baseDir}/../../ && npx tsx scripts/manage.ts clear
```

## 输出示例

检查成功：
```
✅ Cookies are valid. Can auto-login as: 用户昵称
```

检查失败：
```
❌ Cookies are invalid or expired. Please login again.
```

Cookie 信息：
```
📋 Cookie information:
   Count: 25
   Created: 2024/1/15 10:30:00
```

## 使用场景

- 上传前先检查登录状态
- 切换账号时清除数据后重新登录
- 定期检查避免上传时才发现过期
