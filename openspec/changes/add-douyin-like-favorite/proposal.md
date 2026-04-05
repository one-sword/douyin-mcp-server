## Why

当前仓库已经支持抖音登录、视频上传和图文上传，但还不能对已有内容执行互动操作。对于自动化运营场景，仅能发布而不能对指定内容点赞和收藏是不完整的，因此需要补齐一个可被 MCP 和 skill 共同调用的内容互动能力。

## What Changes

- 新增 `douyin_like_and_favorite` MCP 工具，用于对指定抖音内容链接执行点赞和收藏
- 在 `DouyinUploader` 中新增面向内容互动的公共方法，支持处理抖音短链接并在内容页完成点赞与收藏动作
- 为 `skills/douyin` 新增对应的命令行入口，使 skill 也能直接接收内容链接执行同样的动作
- 支持抖音短链接格式输入，例如 `https://v.douyin.com/NDxCxSATlMA/`
- 统一返回结构化结果，明确链接解析结果、点赞结果、收藏结果与失败原因

## Capabilities

### New Capabilities

- `content-like-favorite`: 对指定抖音视频或图文内容执行点赞与收藏，覆盖短链接解析、登录态校验、页面交互和结果返回

### Modified Capabilities

（无，现有上传能力与登录能力的规格不变）

## Impact

- **代码文件**：`mcp-server/douyin-uploader.ts`、`mcp-server/index.ts`、`skills/douyin/douyin-uploader.js`、`skills/douyin/scripts/`
- **API**：新增 `douyin_like_and_favorite` MCP 工具
- **Skill**：新增用于内容点赞+收藏的命令行入口与文档说明
- **依赖**：无新增外部依赖，继续复用 Puppeteer 与现有 Cookie 登录机制
- **系统**：新增对 `https://www.douyin.com` 内容页的自动化交互流程
