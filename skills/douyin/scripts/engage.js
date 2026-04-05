#!/usr/bin/env node
/**
 * 抖音内容互动脚本
 * 用法: node scripts/engage.js --url <douyin-share-link> [options]
 */
import { DouyinUploader } from '../douyin-uploader.js';

function parseArgs(args) {
    const result = {
        headless: false,
    };
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const next = args[i + 1];
        switch (arg) {
            case '--url':
            case '-u':
                if (next) {
                    result.url = next;
                    i++;
                }
                break;
            case '--headless':
                result.headless = true;
                break;
        }
    }
    return result;
}

function printUsage() {
    console.log(`
Usage:
  node scripts/engage.js --url <douyin-share-link> [options]

Required:
  --url, -u <link>        Douyin share link, such as https://v.douyin.com/NDxCxSATlMA/

Options:
  --headless              Run browser in headless mode

Examples:
  node scripts/engage.js --url "https://v.douyin.com/NDxCxSATlMA/"
  node scripts/engage.js -u "https://v.douyin.com/nqKs1FI5CAo/" --headless
`);
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (!args.url) {
        console.error('Error: --url is required\n');
        printUsage();
        process.exit(1);
    }

    const uploader = new DouyinUploader();
    console.log('Starting Douyin like and favorite...');
    console.log(`   URL: ${args.url}`);
    console.log(`   Headless: ${args.headless}`);
    console.log('');

    const result = await uploader.likeAndFavorite({
        url: args.url,
        headless: args.headless,
    });

    if (result.success) {
        console.log('Like and favorite successful!');
        console.log(`   Resolved URL: ${result.resolvedUrl}`);
        console.log(`   Liked: ${result.liked}`);
        console.log(`   Favorited: ${result.favorited}`);
        process.exit(0);
    }

    console.log(`Action failed: ${result.error}`);
    process.exit(1);
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
