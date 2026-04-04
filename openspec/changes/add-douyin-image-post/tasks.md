## 1. 类型定义与参数校验

- [ ] 1.1 在 `douyin-uploader.ts` 中新增 `ImagePostParams` 接口，包含 `imagePaths: string[]`、`description: string`、`title?: string`、`tags?: string[]`、`music?: string`、`headless?: boolean`、`autoPublish?: boolean`
- [ ] 1.2 在 `douyin-uploader.ts` 中新增 `ImagePostResult` 接口，包含 `success: boolean`、`title?: string`、`published?: boolean`、`status?: string`、`error?: string`
- [ ] 1.3 在 `index.ts` 中新增 `UploadImagesArgsSchema` Zod schema，定义参数校验规则（imagePaths 至少 1 张最多 35 张，description 必填，title 可选，其余可选）

## 2. 图片文件验证

- [ ] 2.1 在 `DouyinUploader` 中新增 `validateImageFiles()` 私有方法，检查所有图片文件存在性、是否为常规文件、文件扩展名是否为 jpg/jpeg/png/webp
- [ ] 2.2 在 `uploadImages()` 入口处调用 `validateImageFiles()`，验证失败时提前返回错误

## 3. 发布与验证流程复用

- [ ] 3.1 从 `uploadVideo()` 中提取发布按钮点击逻辑为 `clickPublishButton()` 私有方法
- [ ] 3.2 从 `uploadVideo()` 中提取短信验证处理逻辑为 `handleSmsVerification()` 私有方法
- [ ] 3.3 重构 `uploadVideo()` 以调用提取后的 `clickPublishButton()` 和 `handleSmsVerification()` 方法，确保现有功能不受影响

## 4. 图文上传核心实现

- [ ] 4.1 在 `DouyinUploader` 中新增 `uploadImages()` 公共方法，实现完整图文上传流程骨架（Cookie 加载 → 浏览器启动 → 导航 → 上传 → 填表 → 发布 → 关闭）
- [ ] 4.2 实现图片上传逻辑：导航到 `https://creator.douyin.com/creator-micro/content/post/image`，找到 `input[type="file"]` 并上传所有图片，根据图片数量动态等待上传完成
- [ ] 4.3 实现描述填写逻辑：在 `div[contenteditable="true"]` 区域输入描述文案（必填）
- [ ] 4.4 实现标题填写逻辑：当提供 title 参数时，查找标题输入框并填写，包含选择器失败时的 DOM 操作回退方案（可选）
- [ ] 4.5 实现话题添加逻辑：在描述区域追加 `#tag` 格式的话题标签
- [ ] 4.6 实现背景音乐选择逻辑：查找音乐选择入口，输入搜索关键词，选择第一个搜索结果，搜索失败时记录警告并继续
- [ ] 4.7 调用 `clickPublishButton()` 和 `handleSmsVerification()` 完成发布或保存草稿

## 5. MCP 工具注册

- [ ] 5.1 在 `index.ts` 的 `ListToolsRequestSchema` 处理器中注册 `douyin_upload_images` 工具，定义完整的 inputSchema（required: imagePaths, description）
- [ ] 5.2 在 `index.ts` 的 `CallToolRequestSchema` 处理器中添加 `douyin_upload_images` 的 case 分支，调用 `uploader.uploadImages()` 并格式化返回结果

## 6. 构建验证

- [ ] 6.1 运行 `npm run build` 确保 TypeScript 编译无错误
