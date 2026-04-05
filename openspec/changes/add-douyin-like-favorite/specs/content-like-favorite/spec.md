## ADDED Requirements

### Requirement: MCP 工具 douyin_like_and_favorite 可用

MCP Server SHALL 暴露名为 `douyin_like_and_favorite` 的工具，用于对指定抖音内容链接执行点赞和收藏。

#### Scenario: 工具在 ListTools 响应中可见
- **WHEN** MCP 客户端调用 `ListTools`
- **THEN** 返回的工具列表 SHALL 包含 `douyin_like_and_favorite` 工具及其完整的 `inputSchema`

### Requirement: Skill 命令可触发内容点赞与收藏

Douyin skill SHALL 提供独立的命令行入口，使用户可以传入抖音内容链接并执行点赞和收藏。

#### Scenario: Skill 提供独立互动命令
- **WHEN** 用户查看 skill 的命令入口或使用说明
- **THEN** 系统 SHALL 提供一个独立于上传与登录管理的互动命令，并声明其接收内容链接参数

### Requirement: 内容链接必须为有效的抖音内容入口

系统 SHALL 要求调用方提供一个非空的抖音内容链接参数，用于定位目标视频或图文内容。

#### Scenario: 缺少内容链接时拒绝执行
- **WHEN** 调用 `douyin_like_and_favorite` 或 skill 命令时未提供内容链接
- **THEN** 系统 SHALL 返回参数校验错误，且不启动浏览器

#### Scenario: 链接格式不属于抖音内容入口时拒绝执行
- **WHEN** 提供的链接不是有效的抖音内容短链接
- **THEN** 系统 SHALL 返回参数校验错误，且不启动浏览器

### Requirement: 系统必须解析抖音短链接到最终内容页

系统 SHALL 在浏览器上下文中打开用户提供的抖音短链接，并等待跳转到最终内容页后再执行互动动作。

#### Scenario: 短链接成功跳转到视频或图文内容页
- **WHEN** 用户提供有效的抖音短链接
- **THEN** 系统 SHALL 导航到该链接并解析出最终内容页地址

#### Scenario: 短链接不可访问
- **WHEN** 短链接跳转失败、内容不存在或最终页面不可用
- **THEN** 系统 SHALL 返回结构化错误，不执行点赞和收藏动作

### Requirement: 系统必须校验登录态后再执行互动

系统 SHALL 在执行点赞和收藏前加载已保存的 Cookie，并确认当前会话具备抖音内容互动所需的登录态。

#### Scenario: 没有可用 Cookie
- **WHEN** 本地不存在 Cookie 文件或 Cookie 为空
- **THEN** 系统 SHALL 返回错误 `"No login cookies found. Please login first."`

#### Scenario: Cookie 已失效
- **WHEN** 页面加载后出现登录态失效或要求重新登录
- **THEN** 系统 SHALL 返回错误 `"Login expired. Please login again."`

### Requirement: 系统必须确保目标内容处于已点赞状态

系统 SHALL 在目标内容页检测点赞按钮的当前状态，并确保目标内容最终处于已点赞状态。

#### Scenario: 内容当前未点赞
- **WHEN** 系统检测到目标内容尚未点赞
- **THEN** 系统 SHALL 执行点赞动作，并将点赞结果标记为成功

#### Scenario: 内容当前已点赞
- **WHEN** 系统检测到目标内容已经处于点赞状态
- **THEN** 系统 SHALL 不重复点击导致状态反转，并将点赞结果标记为成功

### Requirement: 系统必须确保目标内容处于已收藏状态

系统 SHALL 在目标内容页检测收藏按钮的当前状态，并确保目标内容最终处于已收藏状态。

#### Scenario: 内容当前未收藏
- **WHEN** 系统检测到目标内容尚未收藏
- **THEN** 系统 SHALL 执行收藏动作，并将收藏结果标记为成功

#### Scenario: 内容当前已收藏
- **WHEN** 系统检测到目标内容已经处于收藏状态
- **THEN** 系统 SHALL 不重复点击导致状态反转，并将收藏结果标记为成功

### Requirement: 点赞收藏能力必须同时适用于视频和图文内容

系统 SHALL 支持对抖音视频内容页和图文内容页执行同样的点赞与收藏动作。

#### Scenario: 目标为视频内容
- **WHEN** 短链接解析后的最终页面为视频内容页
- **THEN** 系统 SHALL 在该页面完成点赞和收藏动作

#### Scenario: 目标为图文内容
- **WHEN** 短链接解析后的最终页面为图文内容页
- **THEN** 系统 SHALL 在该页面完成点赞和收藏动作

### Requirement: 系统必须返回结构化互动结果

系统 SHALL 返回包含执行结果的结构化对象，至少包含 `success`、`url`、`resolvedUrl`、`liked`、`favorited` 和 `error` 字段中的适用项。

#### Scenario: 点赞和收藏均成功
- **WHEN** 系统成功完成内容页解析、点赞与收藏
- **THEN** 系统 SHALL 返回 `{ success: true, url: "<输入链接>", resolvedUrl: "<最终链接>", liked: true, favorited: true }`

#### Scenario: 执行过程中发生失败
- **WHEN** 链接解析、登录态校验、点赞或收藏任一步骤失败
- **THEN** 系统 SHALL 返回 `{ success: false, url: "<输入链接>", error: "<错误信息>" }`
