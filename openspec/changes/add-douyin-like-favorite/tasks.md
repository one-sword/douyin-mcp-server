## 1. 参数模型与结果定义

- [x] 1.1 在 `mcp-server/douyin-uploader.ts` 中新增内容点赞收藏参数与结果类型，至少包含内容链接、解析后链接、点赞状态、收藏状态和错误信息
- [x] 1.2 在 `mcp-server/index.ts` 中新增 `douyin_like_and_favorite` 的 Zod 参数校验，要求内容链接必填且为有效抖音短链接
- [x] 1.3 在 `skills/douyin/douyin-uploader.js` 中同步新增对应的参数与结果结构，保持 skill 与 MCP 语义一致

## 2. 核心内容互动实现

- [x] 2.1 在 TypeScript 侧新增内容互动公共方法，完成 Cookie 加载、浏览器启动、短链接导航、最终内容页解析与关闭清理
- [x] 2.2 实现登录态和页面可交互校验，遇到无 Cookie、Cookie 失效、内容不可访问时返回明确错误
- [x] 2.3 实现点赞状态检测与执行逻辑，确保内容最终处于已点赞状态且不会误触发取消点赞
- [x] 2.4 实现收藏状态检测与执行逻辑，确保内容最终处于已收藏状态且不会误触发取消收藏
- [x] 2.5 兼容视频内容页与图文内容页的按钮查找与动作执行，统一返回结构化结果

## 3. MCP 工具接入

- [x] 3.1 在 `ListToolsRequestSchema` 处理中注册 `douyin_like_and_favorite` 工具并定义完整 `inputSchema`
- [x] 3.2 在 `CallToolRequestSchema` 处理中新增 `douyin_like_and_favorite` 分支，调用互动方法并格式化返回文本

## 4. Skill 命令接入

- [x] 4.1 在 `skills/douyin/scripts/` 下新增独立互动脚本，支持通过命令行传入内容链接执行点赞+收藏
- [x] 4.2 更新 `skills/douyin/package.json` 的 bin 和 scripts 配置，暴露新的 skill 命令入口
- [x] 4.3 更新 `skills/douyin/SKILL.md` 使用说明，补充新命令的用途、参数和示例

## 5. 验证

- [x] 5.1 为 MCP 侧新增或更新测试，覆盖参数校验、成功结果和错误结果
- [x] 5.2 运行 `npm run build`，确认 TypeScript 构建通过
- [x] 5.3 进行一次 skill 侧最小命令校验，确认新命令参数解析与错误提示符合预期
