---
name: jina
description: Jina AI 工具集。支持网页转 Markdown（Reader）、AI 搜索（Search）、文本向量嵌入（Embeddings）。当用户需要读取网页内容、搜索网络信息、生成文本向量时使用。
license: MIT
compatibility: 需要 JINA_API_KEY 环境变量（免费获取：https://jina.ai/?sui=apikey）
allowed-tools: Bash(curl *)
---

# Jina AI 工具集

提供三大核心功能：网页内容提取、AI 搜索、文本向量嵌入。

## 前置要求

需要设置 Jina API Key（免费）：

```bash
export JINA_API_KEY="your-api-key"
```

获取地址：https://jina.ai/?sui=apikey

---

## 功能一：Reader - 网页转 Markdown

将任意网页转换为 LLM 友好的 Markdown 格式。

### 基本用法

```bash
curl "https://r.jina.ai/{URL}"
```

### 示例

**读取网页：**
```bash
curl "https://r.jina.ai/https://example.com"
```

**读取 PDF：**
```bash
curl "https://r.jina.ai/https://example.com/document.pdf"
```

**带 API Key（更高速率）：**
```bash
curl -H "Authorization: Bearer $JINA_API_KEY" \
  "https://r.jina.ai/https://example.com"
```

**返回 JSON 格式：**
```bash
curl -H "Authorization: Bearer $JINA_API_KEY" \
  -H "Accept: application/json" \
  "https://r.jina.ai/https://example.com"
```

### 高级参数

通过请求头控制：

| 请求头 | 说明 | 示例 |
|--------|------|------|
| `X-Return-Format` | 返回格式：markdown/html/text | `-H "X-Return-Format: text"` |
| `X-Target-Selector` | CSS 选择器，只提取匹配元素 | `-H "X-Target-Selector: article"` |
| `X-Wait-For-Selector` | 等待元素出现（动态页面） | `-H "X-Wait-For-Selector: .content"` |
| `X-Remove-Selector` | 移除指定元素 | `-H "X-Remove-Selector: .ads"` |
| `X-With-Links-Summary` | 在末尾添加链接摘要 | `-H "X-With-Links-Summary: true"` |
| `X-With-Images-Summary` | 在末尾添加图片摘要 | `-H "X-With-Images-Summary: true"` |
| `X-No-Cache` | 绕过缓存 | `-H "X-No-Cache: true"` |
| `X-Timeout` | 超时时间（秒） | `-H "X-Timeout: 30"` |

**完整示例：**
```bash
curl -H "Authorization: Bearer $JINA_API_KEY" \
  -H "Accept: application/json" \
  -H "X-Target-Selector: article" \
  -H "X-With-Links-Summary: true" \
  "https://r.jina.ai/https://example.com/blog/post"
```

---

## 功能二：Search - AI 搜索

搜索网络并返回 LLM 优化的结果。

### 基本用法

```bash
curl -X POST "https://s.jina.ai/" \
  -H "Authorization: Bearer $JINA_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"q": "搜索内容"}'
```

### 示例

**基础搜索：**
```bash
curl -X POST "https://s.jina.ai/" \
  -H "Authorization: Bearer $JINA_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"q": "Python 机器学习教程"}'
```

**指定地区和语言：**
```bash
curl -X POST "https://s.jina.ai/" \
  -H "Authorization: Bearer $JINA_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"q": "最新科技新闻", "gl": "cn", "hl": "zh"}'
```

**限制结果数量：**
```bash
curl -X POST "https://s.jina.ai/" \
  -H "Authorization: Bearer $JINA_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"q": "AI news", "num": 5}'
```

### 请求参数

| 参数 | 必需 | 说明 |
|------|------|------|
| `q` | 是 | 搜索查询词 |
| `gl` | 否 | 搜索地区（两字母国家代码，如 cn、us） |
| `hl` | 否 | 搜索语言（两字母语言代码，如 zh、en） |
| `num` | 否 | 返回结果数量上限 |
| `page` | 否 | 分页偏移量 |

### 高级请求头

| 请求头 | 说明 |
|--------|------|
| `X-Site` | 限定搜索域名，如 `X-Site: github.com` |
| `X-Return-Format` | 返回格式：markdown/html/text |
| `X-No-Cache` | 绕过缓存获取实时数据 |

**在特定网站内搜索：**
```bash
curl -X POST "https://s.jina.ai/" \
  -H "Authorization: Bearer $JINA_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-Site: github.com" \
  -d '{"q": "mcp server"}'
```

---

## 功能三：Embeddings - 文本向量嵌入

将文本转换为向量，用于语义搜索、相似度计算等。

### 基本用法

```bash
curl -X POST "https://api.jina.ai/v1/embeddings" \
  -H "Authorization: Bearer $JINA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"input": ["文本内容"], "model": "jina-embeddings-v3"}'
```

### 示例

**单文本嵌入：**
```bash
curl -X POST "https://api.jina.ai/v1/embeddings" \
  -H "Authorization: Bearer $JINA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": ["人工智能的发展趋势"],
    "model": "jina-embeddings-v3"
  }'
```

**多文本批量嵌入：**
```bash
curl -X POST "https://api.jina.ai/v1/embeddings" \
  -H "Authorization: Bearer $JINA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": [
      "机器学习入门教程",
      "深度学习神经网络",
      "自然语言处理技术"
    ],
    "model": "jina-embeddings-v3",
    "normalized": true
  }'
```

**指定任务类型（优化效果）：**
```bash
curl -X POST "https://api.jina.ai/v1/embeddings" \
  -H "Authorization: Bearer $JINA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": ["搜索查询内容"],
    "model": "jina-embeddings-v3",
    "task": "retrieval.query"
  }'
```

### 请求参数

| 参数 | 必需 | 说明 |
|------|------|------|
| `input` | 是 | 文本数组 |
| `model` | 是 | 模型名称 |
| `normalized` | 否 | L2 归一化（余弦相似度用） |
| `embedding_type` | 否 | 输出格式：float/binary/base64 |
| `task` | 否 | 任务类型（见下表） |

### 任务类型

| task 值 | 用途 |
|---------|------|
| `retrieval.query` | 搜索查询 |
| `retrieval.passage` | 待搜索文档 |
| `text-matching` | 语义相似度 |
| `classification` | 文本分类 |
| `separation` | 聚类 |

### 可用模型

| 模型 | 特点 |
|------|------|
| `jina-embeddings-v3` | 多语言，8K 上下文 |
| `jina-embeddings-v4` | 最新，支持图文，32K 上下文 |
| `jina-clip-v2` | 多模态，图文统一嵌入 |

---

## 速率限制

| 服务 | 免费 | 付费 |
|------|------|------|
| Reader (r.jina.ai) | 20 RPM（无 Key）/ 500 RPM | 500-5000 RPM |
| Search (s.jina.ai) | 100 RPM | 100-1000 RPM |
| Embeddings | 100 RPM | 500-5000 RPM |

---

## 常见问题

**Q: 如何获取 API Key？**
访问 https://jina.ai/?sui=apikey 免费获取。

**Q: Reader 返回内容不完整？**
尝试添加 `X-Wait-For-Selector` 等待动态内容加载。

**Q: 搜索结果不够准确？**
使用 `gl` 和 `hl` 参数指定地区和语言。

**Q: Embeddings 用哪个模型？**
一般用途推荐 `jina-embeddings-v3`，需要图文统一用 `jina-clip-v2`。
