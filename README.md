# 抖音视频上传 Skills / Douyin Upload Skills

一键接入 [OpenClaw](https://openclaw.ai) 的抖音视频上传技能包，让你的 AI 助手能够自动上传视频到抖音创作者平台。

---

## 🚀 OpenClaw 快速接入（推荐）

### 一键安装

```bash
# 1. 克隆项目
git clone https://github.com/lancelin111/douyin-mcp-server.git

# 2. 复制 skills 到 OpenClaw 目录
cp -r douyin-mcp-server/skills/* ~/.openclaw/workspace/skills/

# 3. 安装依赖（首次使用）
cd douyin-mcp-server/mcp-server && npm install && npm run build
```

### 或者使用安装脚本

```bash
curl -fsSL https://raw.githubusercontent.com/lancelin111/douyin-mcp-server/main/install.sh | bash
```

### 刷新 Skills

安装完成后，在 OpenClaw 中输入：

```
refresh skills
```

### 开始使用

```
帮我登录抖音
上传视频 /path/to/video.mp4 到抖音，标题是"我的视频"
检查抖音登录状态
```

---

## 📦 Skills 列表

| Skill | 命令 | 功能 |
|-------|-----|------|
| `douyin-login` | `/douyin-login` | 登录抖音账号，保存登录凭证 |
| `douyin-upload` | `/douyin-upload` | 上传视频到抖音（支持标题、描述、标签） |
| `douyin-manage` | `/douyin-manage` | 管理登录状态（检查/查看/清除） |

---

## 📋 前置要求

- Node.js 18+
- Chrome 浏览器（或让 Puppeteer 自动下载 Chromium）
- 抖音创作者账号

---

## 🖥️ 命令行使用

也可以直接通过命令行使用：

```bash
cd douyin-mcp-server

# 登录
npx tsx scripts/login.ts

# 上传视频
npx tsx scripts/upload.ts --video "./video.mp4" --title "视频标题" --tags "标签1,标签2"

# 管理账号
npx tsx scripts/manage.ts check   # 检查登录状态
npx tsx scripts/manage.ts info    # 查看 Cookie 信息
npx tsx scripts/manage.ts clear   # 清除登录数据
```

---

## 🔧 其他接入方式

<details>
<summary>Claude Code 插件方式</summary>

```bash
# 作为插件安装
/plugin install /path/to/douyin-mcp-server

# 或复制到个人 skills
cp -r skills/* ~/.claude/skills/
```

</details>

<details>
<summary>MCP Server 方式</summary>

```bash
# 启动 MCP 服务器
cd mcp-server && npm start
```

在 Claude Desktop 配置：

```json
{
  "mcpServers": {
    "douyin": {
      "command": "node",
      "args": ["/path/to/douyin-mcp-server/mcp-server/dist/index.js"]
    }
  }
}
```

</details>

<details>
<summary>代码集成方式</summary>

```javascript
import { DouyinUploader } from './mcp-server/dist/douyin-uploader.js';

const uploader = new DouyinUploader();

// 登录
await uploader.login(false, 180000);

// 上传
await uploader.uploadVideo({
  videoPath: './video.mp4',
  title: '视频标题',
  tags: ['标签1', '标签2'],
  autoPublish: true
});
```

</details>

---

## 📁 项目结构

```
douyin-mcp-server/
├── skills/                     # Skills 定义（核心）
│   ├── douyin-login/SKILL.md
│   ├── douyin-upload/SKILL.md
│   └── douyin-manage/SKILL.md
├── scripts/                    # CLI 脚本
├── mcp-server/                 # MCP 服务器（可选）
└── .claude-plugin/             # Claude 插件配置（可选）
```

---

## ❓ 常见问题

**Q: 浏览器启动失败？**
```bash
npx puppeteer browsers install chrome
```

**Q: 登录状态过期？**
```bash
npx tsx scripts/manage.ts clear
npx tsx scripts/login.ts
```

**Q: 上传时遇到短信验证？**
程序会自动提示输入验证码，按提示操作即可。

---

## ⚠️ 注意事项

- Cookie 有效期约 30 天，过期需重新登录
- 请遵守抖音平台发布规范
- 建议使用测试账号进行调试

---

## 📄 许可证

MIT License

---

## 🔗 相关链接

- [OpenClaw](https://openclaw.ai) - AI 助手平台
- [ClawHub](https://clawhub.ai) - Skills 市场
- [Agent Skills 标准](https://agentskills.io) - 开放标准
