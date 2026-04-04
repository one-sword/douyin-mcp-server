#!/usr/bin/env npx tsx
/**
 * 抖音图文上传脚本
 * 用法: npx tsx scripts/upload-images.ts --images <path1,path2,...> --description <text> [options]
 */

import { DouyinUploader } from '../mcp-server/douyin-uploader.js';

interface UploadImagesArgs {
  imagePaths: string[];
  description: string;
  title?: string;
  tags?: string[];
  music?: string;
  headless: boolean;
  autoPublish: boolean;
}

function parseArgs(args: string[]): UploadImagesArgs {
  const result: UploadImagesArgs = {
    imagePaths: [],
    description: '',
    headless: false,
    autoPublish: true,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '--images':
      case '-i':
        if (next) {
          result.imagePaths.push(
            ...next.split(',').map((p) => p.trim()).filter(Boolean)
          );
          i++;
        }
        break;
      case '--image':
        if (next) {
          result.imagePaths.push(next);
          i++;
        }
        break;
      case '--description':
      case '-d':
        if (next) {
          result.description = next;
          i++;
        }
        break;
      case '--title':
      case '-t':
        if (next) {
          result.title = next;
          i++;
        }
        break;
      case '--tags':
        if (next) {
          result.tags = next.split(',').map((t) => t.trim()).filter(Boolean);
          i++;
        }
        break;
      case '--music':
      case '-m':
        if (next) {
          result.music = next;
          i++;
        }
        break;
      case '--headless':
        result.headless = true;
        break;
      case '--no-publish':
        result.autoPublish = false;
        break;
    }
  }

  return result;
}

function printUsage() {
  console.log(`
Usage: npx tsx scripts/upload-images.ts --images <path1,path2,...> --description <text> [options]

Required:
  --images, -i <paths>     Comma-separated image paths (1-35 images)
  --description, -d <text> Post description

Optional:
  --image <path>           Add one image (repeat for multiple; combines with --images)
  --title, -t <title>      Post title
  --tags <tag1,tag2>       Comma-separated topic tags
  --music, -m <keyword>    Background music search keyword
  --headless               Run browser in headless mode
  --no-publish             Save as draft instead of publishing

Examples:
  npx tsx scripts/upload-images.ts -i "./a.jpg,./b.jpg" -d "今日随拍" --tags "日常,摄影"
  npx tsx scripts/upload-images.ts --image ./a.png --image ./b.png -d "风景" -t "周末" -m "轻音乐"
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.description) {
    console.error('❌ Error: --description is required\n');
    printUsage();
    process.exit(1);
  }

  if (args.imagePaths.length === 0) {
    console.error('❌ Error: at least one image is required (--images or --image)\n');
    printUsage();
    process.exit(1);
  }

  if (args.imagePaths.length > 35) {
    console.error('❌ Error: at most 35 images allowed\n');
    process.exit(1);
  }

  const uploader = new DouyinUploader();

  console.log('🚀 Starting Douyin image post upload...');
  console.log(`   Images: ${args.imagePaths.length} file(s)`);
  args.imagePaths.forEach((p, idx) => console.log(`     ${idx + 1}. ${p}`));
  console.log(`   Description: ${args.description}`);
  if (args.title) console.log(`   Title: ${args.title}`);
  if (args.tags?.length) console.log(`   Tags: ${args.tags.join(', ')}`);
  if (args.music) console.log(`   Music search: ${args.music}`);
  console.log(`   Auto-publish: ${args.autoPublish}`);
  console.log('');

  const result = await uploader.uploadImages({
    imagePaths: args.imagePaths,
    description: args.description,
    title: args.title,
    tags: args.tags,
    music: args.music,
    headless: args.headless,
    autoPublish: args.autoPublish,
  });

  if (result.success) {
    console.log(`✅ Image post upload ${result.published ? 'and publish ' : ''}successful!`);
    if (result.title) console.log(`   Title: ${result.title}`);
    console.log(`   Status: ${result.status}`);
    process.exit(0);
  } else {
    console.log(`❌ Upload failed: ${result.error}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
