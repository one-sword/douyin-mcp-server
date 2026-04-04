#!/usr/bin/env node
/**
 * 抖音统一上传脚本
 * 用法:
 *   视频: node scripts/upload.js --type video --video <path> --title <title> [options]
 *   图文: node scripts/upload.js --type image --images <path1,path2,...> --description <text> [options]
 */
import { DouyinUploader } from '../douyin-uploader.js';
function parseArgs(args) {
    const result = {
        imagePaths: [],
        headless: false,
        autoPublish: true,
    };
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const next = args[i + 1];
        switch (arg) {
            case '--type':
                if (next === 'video' || next === 'image') {
                    result.type = next;
                    i++;
                }
                break;
            case '--video':
            case '-v':
                if (next) {
                    result.video = next;
                    i++;
                }
                break;
            case '--images':
            case '-i':
                if (next) {
                    result.imagePaths.push(...next.split(',').map((p) => p.trim()).filter(Boolean));
                    i++;
                }
                break;
            case '--image':
                if (next) {
                    result.imagePaths.push(next);
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
            case '--description':
            case '-d':
                if (next) {
                    result.description = next;
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
Usage:
  Video: node scripts/upload.js --type video --video <path> --title <title> [options]
  Image: node scripts/upload.js --type image --images <path1,path2,...> --description <text> [options]

Required:
  --type <video|image>     Explicit upload type

Optional:
  --video, -v <path>       Video file path, only for --type video
  --images, -i <paths>     Image-post content images, only for --type image
  --image <path>           Add one image-post content image, only for --type image
  --title, -t <title>      Video title, or image post title
  --description, -d <text> Video description, or required image post description
  --tags <tag1,tag2>       Comma-separated tags
  --music, -m <keyword>    Background music keyword for image posts only
  --headless               Run browser in headless mode
  --no-publish             Save as draft instead of publishing

Examples:
  node scripts/upload.js --type video --video "./video.mp4" --title "My Video" --tags "fun,daily"
  node scripts/upload.js --type image -i "./a.jpg,./b.jpg" -d "今日随拍" --tags "日常,摄影"
`);
}
async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (!args.type) {
        console.error('❌ Error: --type is required and must be one of: video, image\n');
        printUsage();
        process.exit(1);
    }
    const uploader = new DouyinUploader();
    if (args.type === 'video') {
        if (args.imagePaths.length > 0) {
            console.error('❌ Error: --image/--images are reserved for image-post content and cannot be used when --type is video\n');
            printUsage();
            process.exit(1);
        }
        if (!args.video) {
            console.error('❌ Error: --video is required when --type is video\n');
            printUsage();
            process.exit(1);
        }
        if (!args.title) {
            console.error('❌ Error: --title is required when using --video\n');
            printUsage();
            process.exit(1);
        }
        if (args.music) {
            console.error('❌ Error: --music is only supported for image posts\n');
            printUsage();
            process.exit(1);
        }
        console.log('🚀 Starting Douyin video upload...');
        console.log(`   Video: ${args.video}`);
        console.log(`   Title: ${args.title}`);
        if (args.description)
            console.log(`   Description: ${args.description}`);
        if (args.tags?.length)
            console.log(`   Tags: ${args.tags.join(', ')}`);
        console.log(`   Auto-publish: ${args.autoPublish}`);
        console.log('');
        const result = await uploader.uploadVideo({
            videoPath: args.video,
            title: args.title,
            description: args.description,
            tags: args.tags,
            headless: args.headless,
            autoPublish: args.autoPublish,
        });
        if (result.success) {
            console.log(`✅ Video upload ${result.published ? 'and publish ' : ''}successful!`);
            console.log(`   Title: ${result.title}`);
            console.log(`   Status: ${result.status}`);
            process.exit(0);
        }
        console.log(`❌ Upload failed: ${result.error}`);
        process.exit(1);
    }
    if (args.video) {
        console.error('❌ Error: --video cannot be used when --type is image\n');
        printUsage();
        process.exit(1);
    }
    if (!args.description) {
        console.error('❌ Error: --description is required when using image upload\n');
        printUsage();
        process.exit(1);
    }
    if (args.imagePaths.length === 0) {
        console.error('❌ Error: at least one image is required when --type is image\n');
        printUsage();
        process.exit(1);
    }
    if (args.imagePaths.length > 35) {
        console.error('❌ Error: at most 35 images allowed\n');
        process.exit(1);
    }
    console.log('🚀 Starting Douyin image post upload...');
    console.log(`   Images: ${args.imagePaths.length} file(s)`);
    args.imagePaths.forEach((p, idx) => console.log(`     ${idx + 1}. ${p}`));
    console.log(`   Description: ${args.description}`);
    if (args.title)
        console.log(`   Title: ${args.title}`);
    if (args.tags?.length)
        console.log(`   Tags: ${args.tags.join(', ')}`);
    if (args.music)
        console.log(`   Music search: ${args.music}`);
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
        if (result.title)
            console.log(`   Title: ${result.title}`);
        console.log(`   Status: ${result.status}`);
        process.exit(0);
    }
    console.log(`❌ Upload failed: ${result.error}`);
    process.exit(1);
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
