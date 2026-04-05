## Why

抖音创作者平台除了支持视频发布外，还支持图文作品的发布。当前 MCP Server 仅支持视频上传，无法满足用户发布图文内容的需求。图文是抖音平台上热门的内容形式，新增图文发布能力将大幅扩展本工具的使用场景，让用户可以通过 MCP 协议自动化发布图文作品。

## What Changes

- 新增 `douyin_upload_images` MCP 工具，支持上传图文作品到抖音创作者平台
- 在 `DouyinUploader` 类中新增 `uploadImages()` 方法，实现图文上传的浏览器自动化流程
- 支持以下图文作品元数据：
  - **作品标题**（可选）：图文作品标题
  - **作品描述**（必填）：图文作品描述文案
  - **图片列表**（必填）：本地图片文件路径数组，支持多张图片
  - **话题/标签**（可选）：添加话题标签
  - **背景音乐**（可选）：搜索并选择背景音乐
- 复用现有的登录态管理、Cookie 持久化、短信验证等基础设施
- 新增图文相关的接口类型定义（`ImagePostParams`、`ImagePostResult`）

## Capabilities

### New Capabilities

- `image-post-upload`: 图文作品上传能力，包括图片上传、标题/描述填写、话题添加和背景音乐选择

### Modified Capabilities

（无需修改已有能力的规格，图文上传为独立新增能力）

## Impact

- **代码文件**：`mcp-server/douyin-uploader.ts`（新增 `uploadImages` 方法）、`mcp-server/index.ts`（新增 MCP 工具定义和处理逻辑）
- **API**：新增 `douyin_upload_images` 工具，不影响现有工具
- **依赖**：无新增依赖，复用 Puppeteer 进行浏览器自动化
- **兼容性**：纯增量变更，不影响现有视频上传功能
