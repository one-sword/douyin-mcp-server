# image-post-upload Specification

## Purpose
TBD - created by archiving change add-douyin-image-post. Update Purpose after archive.
## Requirements
### Requirement: MCP 工具 douyin_upload_images 可用

MCP Server SHALL 暴露名为 `douyin_upload_images` 的工具，工具描述为"Upload images as a Douyin image post with title, description, topics, and background music"。

#### Scenario: 工具在 ListTools 响应中可见
- **WHEN** MCP 客户端调用 ListTools
- **THEN** 返回的工具列表中 SHALL 包含 `douyin_upload_images` 工具，且包含完整的 inputSchema 定义

### Requirement: 图文作品必须包含图片和描述

系统 SHALL 要求 `imagePaths`（图片路径数组）和 `description`（描述）为必填参数。`title`（标题）为可选参数。`imagePaths` 数组 SHALL 至少包含 1 张图片，最多包含 35 张图片。

#### Scenario: 缺少必填参数时拒绝
- **WHEN** 调用 `douyin_upload_images` 时未提供 `imagePaths` 或 `description`
- **THEN** 系统 SHALL 返回参数校验错误，不启动浏览器

#### Scenario: 图片数量超限时拒绝
- **WHEN** 提供的 `imagePaths` 数组包含超过 35 个路径
- **THEN** 系统 SHALL 返回错误信息，提示图片数量超过平台限制

#### Scenario: 图片数量为零时拒绝
- **WHEN** 提供的 `imagePaths` 为空数组
- **THEN** 系统 SHALL 返回错误信息，提示至少需要 1 张图片

### Requirement: 图片文件验证

系统 SHALL 在启动浏览器前验证所有提供的图片文件。每个文件 MUST 存在且为常规文件。支持的图片格式 SHALL 包括 jpg、jpeg、png、webp。

#### Scenario: 所有图片文件有效
- **WHEN** 所有 `imagePaths` 中的文件存在且格式正确
- **THEN** 系统 SHALL 继续执行上传流程

#### Scenario: 任一图片文件不存在
- **WHEN** `imagePaths` 中某个路径指向不存在的文件
- **THEN** 系统 SHALL 返回错误，包含不存在文件的路径信息

#### Scenario: 图片格式不支持
- **WHEN** `imagePaths` 中某个文件不是支持的图片格式
- **THEN** 系统 SHALL 返回错误，提示不支持的文件格式

### Requirement: 登录态检查

系统 SHALL 在上传前加载已保存的 Cookie 并验证登录态。如果没有有效的登录态，系统 MUST 返回错误提示用户先登录。

#### Scenario: 无保存的 Cookie
- **WHEN** Cookie 文件不存在或为空
- **THEN** 系统 SHALL 返回错误 "No login cookies found. Please login first."

#### Scenario: Cookie 过期
- **WHEN** 页面导航后 URL 包含 "login"
- **THEN** 系统 SHALL 返回错误 "Login expired. Please login again."

### Requirement: 图片上传到创作者平台

系统 SHALL 导航到抖音创作者平台图文发布页面，找到文件上传输入框，并上传所有指定的图片文件。

#### Scenario: 成功上传所有图片
- **WHEN** 页面加载完成且文件输入框可用
- **THEN** 系统 SHALL 将所有图片文件通过文件输入框上传，并等待上传完成

#### Scenario: 文件输入框不可用
- **WHEN** 页面未找到 `input[type="file"]` 元素
- **THEN** 系统 SHALL 返回错误 "Upload input not found"

### Requirement: 填写作品描述

系统 SHALL 在图文发布表单的描述区域填写用户指定的描述文案。描述为必填参数。

#### Scenario: 成功填写描述
- **WHEN** `description` 参数非空且 contenteditable 区域可用
- **THEN** 系统 SHALL 在描述区域输入描述文案

### Requirement: 填写作品标题

当用户提供 `title` 参数时，系统 SHALL 在图文发布表单中填写标题。标题为可选参数。

#### Scenario: 成功填写标题
- **WHEN** `title` 参数非空且标题输入框可用
- **THEN** 系统 SHALL 清空输入框现有内容并输入用户指定的标题

#### Scenario: 标题输入框不可用时回退
- **WHEN** 通过选择器查找标题输入框失败
- **THEN** 系统 SHALL 尝试通过 DOM 操作回退方法填写标题

#### Scenario: 未提供标题
- **WHEN** `title` 参数未提供或为空
- **THEN** 系统 SHALL 跳过标题填写步骤

### Requirement: 添加话题标签

当用户提供 `tags` 参数时，系统 SHALL 在描述区域追加话题标签，每个标签以 `#` 前缀格式化。

#### Scenario: 成功添加话题
- **WHEN** `tags` 参数包含一个或多个标签
- **THEN** 系统 SHALL 在描述区域追加格式为 `#tag1 #tag2` 的话题文本

#### Scenario: 未提供话题
- **WHEN** `tags` 参数未提供或为空数组
- **THEN** 系统 SHALL 跳过话题添加步骤

### Requirement: 选择背景音乐

当用户提供 `music` 参数时，系统 SHALL 在图文发布页面搜索并选择背景音乐。

#### Scenario: 成功选择音乐
- **WHEN** `music` 参数非空且搜索结果中有匹配项
- **THEN** 系统 SHALL 点击音乐选择区域，输入搜索关键词，并选择第一个搜索结果

#### Scenario: 音乐搜索无结果
- **WHEN** `music` 参数非空但搜索无匹配结果
- **THEN** 系统 SHALL 记录警告日志并继续发布流程，不阻塞上传

#### Scenario: 未提供音乐
- **WHEN** `music` 参数未提供或为空
- **THEN** 系统 SHALL 跳过音乐选择步骤

### Requirement: 发布或保存草稿

系统 SHALL 根据 `autoPublish` 参数决定是否自动点击发布按钮。默认行为为自动发布。

#### Scenario: 自动发布
- **WHEN** `autoPublish` 为 true 或未指定
- **THEN** 系统 SHALL 点击发布按钮，并处理可能出现的短信验证流程

#### Scenario: 保存为草稿
- **WHEN** `autoPublish` 为 false
- **THEN** 系统 SHALL 不点击发布按钮，返回状态为 "Draft saved"

#### Scenario: 发布按钮禁用
- **WHEN** 发布按钮处于禁用状态
- **THEN** 系统 SHALL 等待并重试，若持续禁用则返回草稿保存状态

### Requirement: 返回结构化结果

系统 SHALL 返回包含操作结果的结构化对象，包括 `success`（是否成功）、`title`（作品标题）、`published`（是否已发布）、`status`（状态描述）、`error`（错误信息）。

#### Scenario: 上传并发布成功
- **WHEN** 图片上传和发布流程全部成功完成
- **THEN** 系统 SHALL 返回 `{ success: true, title: "<标题>", published: true, status: "Published" }`

#### Scenario: 上传成功但保存为草稿
- **WHEN** 图片上传成功但未执行发布操作
- **THEN** 系统 SHALL 返回 `{ success: true, title: "<标题>", published: false, status: "Draft saved" }`

#### Scenario: 上传失败
- **WHEN** 上传流程中发生错误
- **THEN** 系统 SHALL 返回 `{ success: false, error: "<错误信息>" }` 并确保浏览器实例被关闭

