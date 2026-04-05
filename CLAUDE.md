# CLAUDE.md

This file provides guidance to Claude Code (`claude.ai/code`) when working with code in this repository.

## Project Overview

This repository is a Douyin MCP Server plus a bundled Douyin skill. It supports three capability groups:

1. Video upload to Douyin Creator Platform
2. Image post upload to Douyin Creator Platform
3. Content interaction by Douyin share link (`like + favorite`)

The codebase is split into two main implementation areas:

1. **MCP Server** (`mcp-server/`): MCP tool definitions and TypeScript automation logic
2. **Skill Bundle** (`skills/douyin/`): Self-contained JavaScript skill runtime and command entrypoints

## Commands

### Development Commands

```bash
# Build the MCP server
cd mcp-server && npm run build

# Run MCP server in development mode
cd mcp-server && npm run dev

# Start the MCP server
cd mcp-server && npm start

# Run MCP tests
cd mcp-server && npm test

# Root helper: build MCP server
npm run build

# Root helper: run MCP tests
npm test

# CLI: upload image post (1-35 images, description required)
npx tsx scripts/upload.ts --type image --images "./a.jpg,./b.jpg" --description "Caption text"

# Skill CLI: like and favorite a Douyin share link
cd skills/douyin && npm run engage -- --url "https://v.douyin.com/NDxCxSATlMA/"
```

### Project Setup

```bash
# Install root dependencies
npm install

# Install MCP server dependencies
cd mcp-server && npm install

# Build TypeScript before running the server
cd mcp-server && npm run build
```

## Architecture

### Core Components

- **MCP Server** (`mcp-server/index.ts`): exposes 7 tools
  - `douyin_login`
  - `douyin_check_login`
  - `douyin_upload_video`
  - `douyin_upload_images`
  - `douyin_like_and_favorite`
  - `douyin_get_cookies`
  - `douyin_clear_cookies`

- **Douyin Uploader** (`mcp-server/douyin-uploader.ts`): TypeScript browser automation class
  - `login()`
  - `checkLogin()`
  - `uploadVideo()`
  - `uploadImages()`
  - `likeAndFavorite()`

- **Skill Runtime** (`skills/douyin/douyin-uploader.js`): JavaScript-side automation mirror for the bundled skill

- **Skill Scripts** (`skills/douyin/scripts/`)
  - `login.js`
  - `upload.js`
  - `manage.js`
  - `engage.js`

### Key Features

- **Cookie Persistence**: login sessions saved to `douyin-cookies.json`
- **Browser Automation**: Puppeteer-based flows with persistent browser data
- **SMS Verification**: terminal prompt when publish verification is required
- **Image Post Upload**: supports 1-35 images, required description, optional title/tags/music
- **Content Interaction**: supports liking and favoriting a Douyin video or image post from a `https://v.douyin.com/.../` share link
- **Structured Results**: MCP and skill flows return explicit success/error state

### Data Flow

1. User calls MCP tools through Claude or another MCP client, or runs skill scripts directly
2. Parameters are validated with Zod on the MCP side and lightweight parsing on the skill side
3. `DouyinUploader` loads cookies, launches the browser, and performs the action
4. Results are returned as structured text or objects

## File Structure

```text
.
├── mcp-server/
│   ├── index.ts
│   ├── douyin-uploader.ts
│   ├── __tests__/
│   ├── package.json
│   └── tsconfig.json
├── scripts/
│   ├── login.ts
│   ├── upload.ts
│   └── manage.ts
├── skills/
│   └── douyin/
│       ├── SKILL.md
│       ├── douyin-uploader.js
│       ├── package.json
│       └── scripts/
│           ├── login.js
│           ├── upload.js
│           ├── manage.js
│           └── engage.js
├── openspec/
├── examples/
├── README.md
└── package.json
```

## Important Technical Details

- Uses ES modules (`"type": "module"`) throughout
- TypeScript is compiled under `mcp-server/dist/`
- Puppeteer uses a persistent user data directory
- Zod is used for runtime parameter validation on the MCP side
- Supports both headless and headed browser modes
- Cookie-based session persistence is reused across upload and interaction flows

## Development Notes

- The MCP server runs as a stdio transport server
- Browser automation requires Chrome or Chromium
- Login flow requires manual browser interaction
- Root CLI upload entry remains unified in `scripts/upload.ts`; `--type` is the only mode selector for video vs image post
- Content interaction is exposed through MCP tool `douyin_like_and_favorite` and skill alias `cd skills/douyin && npm run engage -- --url "<share-link>"`
- Image uploads support `jpg`, `jpeg`, `png`, `webp`
- Content interaction only accepts Douyin share links in the `https://v.douyin.com/.../` format
- Publish and SMS verification logic is shared between video and image post upload flows
