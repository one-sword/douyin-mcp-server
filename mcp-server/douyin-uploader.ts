import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置常量
export const CONFIG = {
  // 超时时间 (毫秒)
  TIMEOUTS: {
    LOGIN_POLL_INTERVAL: 5000,      // 登录状态轮询间隔
    COOKIE_VALIDATION_WAIT: 3000,   // Cookie 验证等待时间
    PAGE_LOAD_WAIT: 3000,           // 页面加载等待时间
    MIN_UPLOAD_WAIT: 15000,         // 最小上传等待时间
    FORM_SUBMIT_WAIT: 2000,         // 表单提交后等待时间
    PUBLISH_WAIT: 3000,             // 发布操作等待时间
    NAVIGATION_TIMEOUT: 30000,      // 页面导航超时
    FILE_INPUT_TIMEOUT: 10000,      // 文件输入框等待超时
    TITLE_INPUT_TIMEOUT: 5000,      // 标题输入框等待超时
    COVER_WAIT: 5000,               // 封面设置等待时间
  },
  // 上传等待时间计算 (基于文件大小)
  UPLOAD_WAIT_MULTIPLIER: 1024,     // fileSize / UPLOAD_WAIT_MULTIPLIER = 额外等待毫秒数
} as const;

interface LoginResult {
  success: boolean;
  user?: string;
  cookieCount?: number;
  error?: string;
}

interface CheckLoginResult {
  isValid: boolean;
  user?: string;
}

interface UploadParams {
  videoPath: string;
  title: string;
  description?: string;
  tags?: string[];
  headless?: boolean;
  autoPublish?: boolean;
}

interface UploadResult {
  success: boolean;
  title?: string;
  published?: boolean;
  status?: string;
  error?: string;
}

interface CookiesInfo {
  exists: boolean;
  count?: number;
  user?: string;
  created?: string;
}

interface ImagePostParams {
  imagePaths: string[];
  description: string;
  title?: string;
  tags?: string[];
  music?: string;
  headless?: boolean;
  autoPublish?: boolean;
}

interface ImagePostResult {
  success: boolean;
  title?: string;
  published?: boolean;
  status?: string;
  error?: string;
}

interface ContentLikeFavoriteParams {
  url: string;
  headless?: boolean;
}

interface ContentLikeFavoriteResult {
  success: boolean;
  url: string;
  resolvedUrl?: string;
  liked?: boolean;
  favorited?: boolean;
  error?: string;
}

interface InteractionSnapshot {
  found: boolean;
  active: boolean;
  text?: string;
}

const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const DOUYIN_SHARE_URL_PATTERN = /^https:\/\/v\.douyin\.com\/[A-Za-z0-9_-]+\/?(?:[?#].*)?$/i;

export class DouyinUploader {
  private cookiesPath: string;
  private userDataDir: string;

  constructor() {
    this.cookiesPath = path.join(__dirname, '../douyin-cookies.json');
    this.userDataDir = path.join(__dirname, '../chrome-user-data');
  }

  async login(headless: boolean = false, timeout: number = 180000): Promise<LoginResult> {
    let browser: Browser | null = null;

    try {
      browser = await this.launchBrowser(headless);
      const page = await browser.newPage();

      // 访问抖音创作者平台
      await page.goto('https://creator.douyin.com', {
        waitUntil: 'domcontentloaded',
        timeout: CONFIG.TIMEOUTS.NAVIGATION_TIMEOUT
      });

      // 等待用户登录
      console.error('Waiting for user login...');
      const startTime = Date.now();

      while (Date.now() - startTime < timeout) {
        await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.LOGIN_POLL_INTERVAL));

        const currentUrl = page.url();
        const isLoggedIn = !currentUrl.includes('/login') &&
                          !currentUrl.includes('passport') &&
                          (currentUrl.includes('creator.douyin.com/creator') ||
                           currentUrl.includes('creator.douyin.com/home'));

        if (isLoggedIn) {
          // 获取用户信息
          const user = await this.getUserInfo(page);

          // 保存cookies
          const cookies = await page.cookies();
          await fs.writeFile(this.cookiesPath, JSON.stringify(cookies, null, 2));
          // Restrict cookie file permissions (owner read/write only)
          await fs.chmod(this.cookiesPath, 0o600).catch(() => {});

          await browser.close();
          return {
            success: true,
            user,
            cookieCount: cookies.length
          };
        }
      }

      await browser.close();
      return {
        success: false,
        error: 'Login timeout'
      };

    } catch (error) {
      if (browser) await browser.close();
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async checkLogin(headless: boolean = true): Promise<CheckLoginResult> {
    let browser: Browser | null = null;

    try {
      // 检查cookies文件
      const cookiesData = await fs.readFile(this.cookiesPath, 'utf-8');
      const cookies = JSON.parse(cookiesData);

      if (!cookies || cookies.length === 0) {
        return { isValid: false };
      }

      // 测试cookies
      browser = await this.launchBrowser(headless);
      const page = await browser.newPage();
      await page.setCookie(...cookies);

      await page.goto('https://creator.douyin.com', {
        waitUntil: 'networkidle2',
        timeout: CONFIG.TIMEOUTS.NAVIGATION_TIMEOUT
      });

      await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.COOKIE_VALIDATION_WAIT));

      const currentUrl = page.url();
      const isValid = !currentUrl.includes('login');

      let user = undefined;
      if (isValid) {
        user = await this.getUserInfo(page);
      }

      await browser.close();
      return { isValid, user };

    } catch (error) {
      if (browser) await browser.close();
      return { isValid: false };
    }
  }

  async uploadVideo(params: UploadParams): Promise<UploadResult> {
    let browser: Browser | null = null;

    try {
      // 验证视频文件
      const videoStats = await fs.stat(params.videoPath);
      if (!videoStats.isFile()) {
        throw new Error('Video file not found');
      }

      // 加载cookies
      const cookiesData = await fs.readFile(this.cookiesPath, 'utf-8');
      const cookies = JSON.parse(cookiesData);

      if (!cookies || cookies.length === 0) {
        throw new Error('No login cookies found. Please login first.');
      }

      // 启动浏览器
      browser = await this.launchBrowser(params.headless || false);
      const page = await browser.newPage();

      // 设置cookies
      await page.setCookie(...cookies);

      // 访问上传页面
      await page.goto('https://creator.douyin.com/creator-micro/content/upload', {
        waitUntil: 'networkidle2',
        timeout: CONFIG.TIMEOUTS.NAVIGATION_TIMEOUT
      });

      await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.PAGE_LOAD_WAIT));

      // 检查登录状态
      if (page.url().includes('login')) {
        await browser.close();
        throw new Error('Login expired. Please login again.');
      }

      // 上传视频
      const fileInput = await page.waitForSelector('input[type="file"]', {
        timeout: CONFIG.TIMEOUTS.FILE_INPUT_TIMEOUT,
        visible: false
      });

      if (!fileInput) {
        throw new Error('Upload input not found');
      }

      await fileInput.uploadFile(params.videoPath);

      // 等待上传
      const fileSize = videoStats.size;
      const waitTime = Math.max(CONFIG.TIMEOUTS.MIN_UPLOAD_WAIT, fileSize / CONFIG.UPLOAD_WAIT_MULTIPLIER);
      await new Promise(r => setTimeout(r, waitTime));

      // 填写标题
      try {
        await page.waitForSelector('input[placeholder*="标题"]', { timeout: CONFIG.TIMEOUTS.TITLE_INPUT_TIMEOUT });
        await page.click('input[placeholder*="标题"]');
        // 检测操作系统，使用正确的修饰键
        const isMac = process.platform === 'darwin';
        const modifierKey = isMac ? 'Meta' : 'Control';
        await page.keyboard.down(modifierKey);
        await page.keyboard.press('A');
        await page.keyboard.up(modifierKey);
        await page.keyboard.type(params.title);
      } catch (titleError) {
        // 备用方法：直接操作 DOM
        console.error('Title input via selector failed, trying fallback method:',
          titleError instanceof Error ? titleError.message : String(titleError));
        await page.evaluate((title) => {
          const input = document.querySelector('input[type="text"]');
          if (input) {
            (input as HTMLInputElement).value = title;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }, params.title);
      }

      // 填写描述
      if (params.description) {
        try {
          const descInput = await page.$('div[contenteditable="true"]');
          if (descInput) {
            await descInput.click();
            await page.keyboard.type(params.description);
          }
        } catch (descError) {
          console.error('Failed to fill description:',
            descError instanceof Error ? descError.message : String(descError));
        }
      }

      // 添加标签
      if (params.tags && params.tags.length > 0) {
        const tagText = params.tags.map(tag => `#${tag}`).join(' ');
        try {
          const descInput = await page.$('div[contenteditable="true"]');
          if (descInput) {
            await descInput.click();
            await page.keyboard.type(' ' + tagText);
          }
        } catch (tagError) {
          console.error('Failed to add tags:',
            tagError instanceof Error ? tagError.message : String(tagError));
        }
      }

      await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.FORM_SUBMIT_WAIT));

      // 设置封面（必填项）
      await this.setCover(page);

      await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.FORM_SUBMIT_WAIT));

      // 发布
      let published = false;
      if (params.autoPublish !== false) {
        const publishButtonState = await this.getPublishButtonState(page);

        if (publishButtonState === 'disabled') {
          console.error('⚠️  Publish button is disabled, retrying cover setup...');
          await this.setCover(page);
          await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.FORM_SUBMIT_WAIT));
        }

        published = await this.clickPublishButton(page);

        if (published) {
          await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.PUBLISH_WAIT));
          await this.handleSmsVerification(page);
          await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.PUBLISH_WAIT));
        }
      }

      await browser.close();

      return {
        success: true,
        title: params.title,
        published,
        status: published ? 'Published' : 'Draft saved'
      };

    } catch (error) {
      if (browser) await browser.close();
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async getCookiesInfo(): Promise<CookiesInfo> {
    try {
      const cookiesData = await fs.readFile(this.cookiesPath, 'utf-8');
      const cookies = JSON.parse(cookiesData);

      const stats = await fs.stat(this.cookiesPath);

      return {
        exists: true,
        count: cookies.length,
        created: stats.mtime.toLocaleString()
      };
    } catch (error) {
      // Cookie 文件不存在是正常情况，不需要记录错误
      return { exists: false };
    }
  }

  async clearData(): Promise<void> {
    try {
      await fs.unlink(this.cookiesPath);
    } catch (error) {
      // 文件不存在时忽略错误
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Failed to delete cookies file:',
          error instanceof Error ? error.message : String(error));
      }
    }

    try {
      await fs.rm(this.userDataDir, { recursive: true, force: true });
    } catch (error) {
      // 目录不存在时忽略错误
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error('Failed to delete user data directory:',
          error instanceof Error ? error.message : String(error));
      }
    }
  }

  private async launchBrowser(headless: boolean): Promise<Browser> {
    // 支持连接到已存在的 CDP 端点（例如远程浏览器）
    // CDP_URL 通过 skills.entries.douyin.env.CDP_URL 配置
    const cdpUrl = process.env.CDP_URL || 'http://localhost:9222';
    let browser: Browser;

    try {
      // 优先尝试连接到已存在的浏览器
      browser = await puppeteer.connect({
        browserURL: cdpUrl,
        defaultViewport: headless ? { width: 1400, height: 900 } : null,
      });

      console.log(`Connected to existing browser at ${cdpUrl}`);
      return browser;
    } catch (connectError) {
      console.log(`Could not connect to ${cdpUrl}, launching new browser...`);
    }

    // 如果连接失败，则启动新的本地浏览器
    browser = await puppeteer.launch({
      headless,
      slowMo: headless ? 0 : 50,
      args: [
        '--window-size=1400,900',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--disable-notifications'
      ],
      defaultViewport: headless ? { width: 1400, height: 900 } : null,
      userDataDir: this.userDataDir,
      ignoreDefaultArgs: ['--enable-automation']
    });

    // 设置默认权限
    if (!headless) {
      const context = browser.defaultBrowserContext();

      // Only request permissions needed for video upload workflow
      await context.overridePermissions('https://creator.douyin.com', [
        'clipboard-read',
        'clipboard-write'
      ]).catch((error) => {
        console.error('Failed to override permissions for creator.douyin.com:',
          error instanceof Error ? error.message : String(error));
      });

      await context.overridePermissions('https://www.douyin.com', [
        'clipboard-read',
        'clipboard-write'
      ]).catch((error) => {
        console.error('Failed to override permissions for www.douyin.com:',
          error instanceof Error ? error.message : String(error));
      });
    }

    return browser;
  }

  private async getUserInfo(page: Page): Promise<string> {
    try {
      return await page.evaluate(() => {
        const selectors = ['.user-name', '.nickname', '[class*="username"]', '[class*="user"]'];
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent) {
            return element.textContent.trim();
          }
        }
        return 'User';
      });
    } catch (error) {
      console.error('Failed to get user info:',
        error instanceof Error ? error.message : String(error));
      return 'User';
    }
  }

  private async getPublishButtonState(page: Page): Promise<string> {
    return await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const publishBtn = buttons.find(btn => {
        const text = btn.textContent?.trim() || '';
        return text === '发布' || text === '立即发布';
      });

      if (!publishBtn) return 'not_found';
      if (publishBtn.disabled) return 'disabled';
      return 'enabled';
    });
  }

  private async clickPublishButton(page: Page): Promise<boolean> {
    return await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const publishBtn = buttons.find(btn => {
        const text = btn.textContent?.trim() || '';
        return text === '发布' || text === '立即发布';
      });

      if (publishBtn && !publishBtn.disabled) {
        publishBtn.click();
        return true;
      }
      return false;
    });
  }

  private async handleSmsVerification(page: Page): Promise<void> {
    const hasSmsVerification = await page.evaluate(() => {
      const text = document.body.innerText || '';
      return text.includes('短信验证') || text.includes('验证码') || text.includes('手机验证');
    });

    if (hasSmsVerification) {
      console.error('\n📱 检测到短信验证页面');

      const smsSent = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const sendBtn = buttons.find(btn => {
          const text = btn.textContent?.trim() || '';
          return text.includes('发送') || text.includes('获取验证码') || text === '验证';
        });

        if (sendBtn && !sendBtn.disabled) {
          sendBtn.click();
          return true;
        }
        return false;
      });

      if (smsSent) {
        console.error('✅ 已发送验证码到您的手机');
      } else {
        console.error('ℹ️  验证码可能已发送，请查看手机');
      }

      console.error('\n请输入收到的验证码：');

      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const verifyCode = await new Promise<string>((resolve) => {
        rl.question('验证码: ', (answer) => {
          rl.close();
          resolve(answer.trim());
        });
      });

      const codeInputs = await page.$$('input[type="text"], input[type="tel"], input[placeholder*="验证码"]');
      if (codeInputs.length > 0) {
        if (codeInputs.length === 6 || codeInputs.length === 4) {
          for (let i = 0; i < verifyCode.length && i < codeInputs.length; i++) {
            await codeInputs[i].type(verifyCode[i]);
          }
        } else {
          await codeInputs[0].type(verifyCode);
        }
      }

      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const confirmBtn = buttons.find(btn => {
          const text = btn.textContent?.trim() || '';
          return text.includes('确认') || text.includes('确定') || text.includes('提交') || text === '验证';
        });

        if (confirmBtn && !confirmBtn.disabled) {
          confirmBtn.click();
        }
      });

      console.error('✅ 验证码已提交');
      await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.PUBLISH_WAIT));

      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const publishBtn = buttons.find(btn => {
          const text = btn.textContent?.trim() || '';
          return text === '发布' || text === '立即发布' || text.includes('确认发布');
        });

        if (publishBtn && !publishBtn.disabled) {
          publishBtn.click();
        }
      });

      await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.PUBLISH_WAIT));
    } else {
      await page.evaluate(() => {
        const confirmBtns = document.querySelectorAll('button');
        for (const btn of confirmBtns) {
          const text = btn.textContent || '';
          if (text.includes('确认') || text.includes('确定')) {
            btn.click();
            return;
          }
        }
      });
    }
  }

  private async validateImageFiles(imagePaths: string[]): Promise<void> {
    for (const imgPath of imagePaths) {
      const stats = await fs.stat(imgPath).catch(() => null);
      if (!stats || !stats.isFile()) {
        throw new Error(`Image file not found: ${imgPath}`);
      }

      const ext = path.extname(imgPath).toLowerCase();
      if (!SUPPORTED_IMAGE_EXTENSIONS.includes(ext)) {
        throw new Error(`Unsupported image format "${ext}" for file: ${imgPath}. Supported: ${SUPPORTED_IMAGE_EXTENSIONS.join(', ')}`);
      }
    }
  }

  private async dismissKnownPopups(page: Page): Promise<void> {
    await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('button, div, span, a'));
      const target = nodes.find(el => {
        const text = (el.textContent || '').trim();
        return text === '我知道了' || text === '知道了';
      });

      if (target) {
        (target as HTMLElement).click();
      }
    }).catch(() => {});
  }

  private async markImageUploadTrigger(page: Page): Promise<boolean> {
    return await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const continueButton = buttons.find(btn => {
        const text = (btn.textContent || '').replace(/\s+/g, '');
        return text.includes('继续添加');
      });

      if (continueButton && !continueButton.disabled) {
        continueButton.setAttribute('data-douyin-upload-trigger', '1');
        return true;
      }

      const nodes = Array.from(document.querySelectorAll('div, button, span, label'));
      const candidates = nodes
        .map((el) => {
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          const text = (el.textContent || '').replace(/\s+/g, '');
          const className = String((el as HTMLElement).className || '');

          return {
            el,
            rect,
            style,
            text,
            className,
          };
        })
        .filter(({ rect }) => (
          rect.x > window.innerWidth * 0.7 &&
          rect.y < 250 &&
          rect.width > 180 &&
          rect.height > 250
        ))
        .filter(({ text, className, style }) => (
          (text.includes('点击上传') && text.includes('拖入此区域')) ||
          (className.includes('content-right') && text.includes('点击上传')) ||
          (style.cursor === 'pointer' && text.includes('点击上传')) ||
          (style.borderStyle === 'solid' && text.includes('点击上传'))
        ))
        .sort((a, b) => (a.rect.width * a.rect.height) - (b.rect.width * b.rect.height));

      const target = candidates[0];
      if (!target) {
        return false;
      }

      target.el.setAttribute('data-douyin-upload-trigger', '1');
      return true;
    });
  }

  private async resetExistingImageDraft(page: Page): Promise<boolean> {
    return await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const target = buttons.find(el => {
        const text = (el.textContent || '').replace(/\s+/g, '');
        return text.includes('清空并重新上传');
      });

      if (!target) {
        return false;
      }

      target.click();
      return true;
    });
  }

  private async waitForImageUploadComplete(page: Page, imageCount: number): Promise<void> {
    await page.waitForFunction((expectedCount) => {
      const text = (document.body.innerText || '').replace(/\s+/g, '');
      return text.includes('已添加' + expectedCount + '张图片') ||
        text.includes('继续添加') ||
        text.includes('清空并重新上传') ||
        text.includes('预览图文');
    }, {
      timeout: Math.max(CONFIG.TIMEOUTS.MIN_UPLOAD_WAIT, imageCount * 5000),
    }, imageCount);
  }

  private async uploadImagesByPicker(page: Page, imagePaths: string[]): Promise<void> {
    const existingInput = await page.$('input[type="file"]');
    if (existingInput) {
      await existingInput.uploadFile(...imagePaths);
      return;
    }

    let marked = await this.markImageUploadTrigger(page);
    if (!marked) {
      const reset = await this.resetExistingImageDraft(page);
      if (reset) {
        await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.FORM_SUBMIT_WAIT));
        marked = await this.markImageUploadTrigger(page);
      }
    }

    if (!marked) {
      throw new Error('Image upload trigger not found');
    }

    const chooserPromise = page.waitForFileChooser({
      timeout: CONFIG.TIMEOUTS.FILE_INPUT_TIMEOUT,
    });

    await page.click('[data-douyin-upload-trigger="1"]');

    const chooser = await chooserPromise;
    await chooser.accept(imagePaths);
  }

  private async selectMusic(page: Page, music: string): Promise<boolean> {
    try {
      console.error(`🎵 Selecting background music: ${music}`);

      await page.waitForFunction(() => {
        const elements = Array.from(document.querySelectorAll('button, span, div, a'));
        return elements.some((el) => {
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          const className = String((el as HTMLElement).className || '');
          const text = (el.textContent || '').replace(/\s+/g, '');
          return rect.x > window.innerWidth * 0.35 &&
            rect.x < window.innerWidth * 0.98 &&
            rect.y > 120 &&
            rect.y < 650 &&
            rect.width > 20 &&
            rect.height > 20 &&
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            (className.includes('action-') ||
              className.includes('container-right') ||
              text.includes('选择音乐'));
        });
      }, {
        timeout: CONFIG.TIMEOUTS.FILE_INPUT_TIMEOUT,
      }).catch(() => null);

      let musicEntryClicked = false;
      const directMusicHandles = await page.$$('span[class*="action-"], div[class*="container-right"]');
      for (const handle of directMusicHandles) {
        const box = await handle.boundingBox();
        if (!box) {
          continue;
        }
        await handle.click();
        musicEntryClicked = true;
        break;

        const text = await handle.evaluate((el) => (el.textContent || '').replace(/\s+/g, ''));
        if (!text.includes('选择音乐')) {
          continue;
        }

        await handle.click();
        musicEntryClicked = true;
        break;
      }

      if (!musicEntryClicked) {
        musicEntryClicked = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('button, span, div, a'));
        const directAction = elements
          .map((el) => {
            const rect = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            return {
              el,
              rect,
              style,
              text: (el.textContent || '').replace(/\s+/g, ''),
              className: String((el as HTMLElement).className || ''),
            };
          })
          .filter(({ rect, style }) => (
            rect.x > window.innerWidth * 0.35 &&
            rect.x < window.innerWidth * 0.98 &&
            rect.y > 120 &&
            rect.y < 650 &&
            rect.width > 20 &&
            rect.width < 140 &&
            rect.height > 20 &&
            rect.height < 60 &&
            style.display !== 'none' &&
            style.visibility !== 'hidden'
          ))
          .filter(({ text, className, style }) => (
            text.includes('选择音乐') ||
            className.includes('action-') ||
            className.includes('container-right') ||
            (style.cursor === 'pointer' && text.includes('音乐'))
          ))
          .sort((a, b) => (a.rect.width * a.rect.height) - (b.rect.width * b.rect.height))[0];

        if (directAction) {
          (directAction.el as HTMLElement).click();
          return true;
        }
        const exactAction = elements
          .map((el) => {
            const rect = el.getBoundingClientRect();
            return {
              el,
              rect,
              text: (el.textContent || '').replace(/\s+/g, ''),
              className: String((el as HTMLElement).className || ''),
            };
          })
          .filter(({ rect, text, className }) => (
            rect.x > window.innerWidth * 0.35 &&
            rect.x < window.innerWidth * 0.98 &&
            rect.y > 120 &&
            rect.y < 650 &&
            rect.width > 20 &&
            rect.height > 20 &&
            text.includes('选择音乐')
          ))
          .sort((a, b) => (a.rect.width * a.rect.height) - (b.rect.width * b.rect.height))[0];

        if (exactAction) {
          (exactAction.el as HTMLElement).click();
          return true;
        }

        const rowContainer = elements
          .map((el) => {
            const rect = el.getBoundingClientRect();
            return {
              el,
              rect,
              text: (el.textContent || '').replace(/\s+/g, ''),
            };
          })
          .filter(({ rect, text }) => (
            rect.x > window.innerWidth * 0.25 &&
            rect.x < window.innerWidth * 0.8 &&
            rect.y > 650 &&
            rect.y < 800 &&
            rect.width > 300 &&
            text.includes('点击添加合适作品风格音乐') &&
            text.includes('选择音乐')
          ))
          .sort((a, b) => (a.rect.width * a.rect.height) - (b.rect.width * b.rect.height))[0];

        if (rowContainer) {
          const action = Array.from(rowContainer.el.querySelectorAll('button, span, div, a'))
            .find((child) => (child.textContent || '').replace(/\s+/g, '').includes('选择音乐'));

          if (action) {
            (action as HTMLElement).click();
            return true;
          }

          (rowContainer.el as HTMLElement).click();
          return true;
        }

        return false;
      });
      }

      if (!musicEntryClicked) {
        console.error('⚠️  Music selection entry not found, skipping');
        return false;
      }

      await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.FORM_SUBMIT_WAIT));

      const searchInput = await page.waitForSelector(
        'input[placeholder*="搜索"], input[placeholder*="音乐"], input[placeholder*="歌曲"], input[type="search"]',
        { timeout: CONFIG.TIMEOUTS.FILE_INPUT_TIMEOUT }
      ).catch(() => null);

      if (searchInput) {
        await searchInput.click();
        await searchInput.evaluate((input) => {
          (input as HTMLInputElement).value = '';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await searchInput.type(music);
        await page.keyboard.press('Enter');
        await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.PAGE_LOAD_WAIT));

        const applyButton = await page.waitForSelector(
          '[class*="music-selector-container"] button[class*="apply-btn"], ' +
          '[class*="music-collection-container"] button[class*="apply-btn"]',
          { timeout: CONFIG.TIMEOUTS.FILE_INPUT_TIMEOUT }
        ).catch(() => null);

        if (applyButton) {
          await applyButton.evaluate((button) => {
            (button as HTMLElement).click();
          });
          console.error('鉁?Background music selected');
          await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.FORM_SUBMIT_WAIT));
          return true;
        }

        const musicSelected = await page.evaluate(() => {
          const musicItems = document.querySelectorAll(
            '[class*="music-item"], [class*="musicItem"], [class*="song-item"], [class*="songItem"], ' +
            '[class*="music-list"] > div, [class*="musicList"] > div, [class*="search-result"] > div'
          );

          if (musicItems.length > 0) {
            const useBtn = musicItems[0].querySelector('button, span[role="button"], div[role="button"]');
            if (useBtn) {
              (useBtn as HTMLElement).click();
              return true;
            }
            (musicItems[0] as HTMLElement).click();
            return true;
          }
          return false;
        });

        if (musicSelected) {
          console.error('✅ Background music selected');
          await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.FORM_SUBMIT_WAIT));
          return true;
        }
      }

      console.error('⚠️  Music search failed, continuing without music');
      // 关闭可能打开的音乐面板
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.FORM_SUBMIT_WAIT));
      return false;

    } catch (error) {
      console.error('Failed to select music:',
        error instanceof Error ? error.message : String(error));
      await page.keyboard.press('Escape').catch(() => {});
      return false;
    }
  }

  async uploadImages(params: ImagePostParams): Promise<ImagePostResult> {
    let browser: Browser | null = null;

    try {
      await this.validateImageFiles(params.imagePaths);

      const cookiesData = await fs.readFile(this.cookiesPath, 'utf-8');
      const cookies = JSON.parse(cookiesData);

      if (!cookies || cookies.length === 0) {
        throw new Error('No login cookies found. Please login first.');
      }

      browser = await this.launchBrowser(params.headless || false);
      const page = await browser.newPage();

      await page.setCookie(...cookies);

      await page.goto('https://creator.douyin.com/creator-micro/content/post/image', {
        waitUntil: 'networkidle2',
        timeout: CONFIG.TIMEOUTS.NAVIGATION_TIMEOUT
      });

      await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.PAGE_LOAD_WAIT));

      if (page.url().includes('login')) {
        await browser.close();
        throw new Error('Login expired. Please login again.');
      }

      await this.dismissKnownPopups(page);
      await this.uploadImagesByPicker(page, params.imagePaths);
      await this.waitForImageUploadComplete(page, params.imagePaths.length);
      await this.dismissKnownPopups(page);

      // 填写描述（必填）
      try {
        const descInput = await page.$('div[contenteditable="true"]');
        if (descInput) {
          await descInput.click();
          await page.keyboard.type(params.description);
        }
      } catch (descError) {
        console.error('Failed to fill description:',
          descError instanceof Error ? descError.message : String(descError));
      }

      // 添加话题标签
      if (params.tags && params.tags.length > 0) {
        const tagText = params.tags.map(tag => `#${tag}`).join(' ');
        try {
          const descInput = await page.$('div[contenteditable="true"]');
          if (descInput) {
            await descInput.click();
            await page.keyboard.type(' ' + tagText);
          }
        } catch (tagError) {
          console.error('Failed to add tags:',
            tagError instanceof Error ? tagError.message : String(tagError));
        }
      }

      // 填写标题（可选）
      if (params.title) {
        try {
          await page.waitForSelector('input[placeholder*="标题"]', { timeout: CONFIG.TIMEOUTS.TITLE_INPUT_TIMEOUT });
          await page.click('input[placeholder*="标题"]');
          const isMac = process.platform === 'darwin';
          const modifierKey = isMac ? 'Meta' : 'Control';
          await page.keyboard.down(modifierKey);
          await page.keyboard.press('A');
          await page.keyboard.up(modifierKey);
          await page.keyboard.type(params.title);
        } catch (titleError) {
          console.error('Title input via selector failed, trying fallback method:',
            titleError instanceof Error ? titleError.message : String(titleError));
          await page.evaluate((title) => {
            const input = document.querySelector('input[type="text"]');
            if (input) {
              (input as HTMLInputElement).value = title;
              input.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }, params.title);
        }
      }

      // 选择背景音乐（可选）
      if (params.music) {
        await this.selectMusic(page, params.music);
      }

      await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.FORM_SUBMIT_WAIT));

      // 发布
      let published = false;
      if (params.autoPublish !== false) {
        const publishButtonState = await this.getPublishButtonState(page);

        if (publishButtonState === 'disabled') {
          console.error('⚠️  Publish button is disabled, waiting...');
          await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.PUBLISH_WAIT));
        }

        published = await this.clickPublishButton(page);

        if (published) {
          await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.PUBLISH_WAIT));
          await this.handleSmsVerification(page);
          await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.PUBLISH_WAIT));
        }
      }

      await browser.close();

      return {
        success: true,
        title: params.title,
        published,
        status: published ? 'Published' : 'Draft saved'
      };

    } catch (error) {
      if (browser) await browser.close();
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async likeAndFavorite(params: ContentLikeFavoriteParams): Promise<ContentLikeFavoriteResult> {
    let browser: Browser | null = null;

    try {
      this.validateContentUrl(params.url);

      const cookies = await this.loadCookies();
      browser = await this.launchBrowser(params.headless || false);
      const page = await browser.newPage();

      await page.setCookie(...cookies);

      const resolvedUrl = await this.resolveContentUrl(page, params.url);
      await this.ensureContentPageReady(page);

      await this.dismissContentPopups(page);
      const liked = await this.ensureInteractionActivated(page, 'like');
      await this.dismissContentPopups(page);
      const favorited = await this.ensureInteractionActivated(page, 'favorite');

      await browser.close();

      return {
        success: true,
        url: params.url,
        resolvedUrl,
        liked,
        favorited,
      };
    } catch (error) {
      if (browser) await browser.close();
      return {
        success: false,
        url: params.url,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private validateContentUrl(url: string): void {
    if (!url || !url.trim()) {
      throw new Error('Content url is required');
    }

    if (!DOUYIN_SHARE_URL_PATTERN.test(url.trim())) {
      throw new Error('Content url must be a valid Douyin share link');
    }
  }

  private async loadCookies(): Promise<Parameters<Page['setCookie']>> {
    let cookies: Parameters<Page['setCookie']>;

    try {
      const cookiesData = await fs.readFile(this.cookiesPath, 'utf-8');
      cookies = JSON.parse(cookiesData) as Parameters<Page['setCookie']>;
    } catch (error) {
      throw new Error('No login cookies found. Please login first.');
    }

    if (!Array.isArray(cookies) || cookies.length === 0) {
      throw new Error('No login cookies found. Please login first.');
    }

    return cookies;
  }

  private async resolveContentUrl(page: Page, url: string): Promise<string> {
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: CONFIG.TIMEOUTS.NAVIGATION_TIMEOUT
    });

    await page.waitForFunction(() => {
      return window.location.href.includes('douyin.com') && document.readyState === 'complete';
    }, {
      timeout: CONFIG.TIMEOUTS.NAVIGATION_TIMEOUT
    }).catch(() => null);

    await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.PAGE_LOAD_WAIT));

    const resolvedUrl = page.url();
    if (!resolvedUrl.includes('douyin.com')) {
      throw new Error('Content page is not available');
    }

    return resolvedUrl;
  }

  private async ensureContentPageReady(page: Page): Promise<void> {
    const currentUrl = page.url();
    if (currentUrl.includes('login') || currentUrl.includes('passport')) {
      throw new Error('Login expired. Please login again.');
    }

    await page.waitForFunction(() => {
      return Boolean(document.body && document.body.innerText.trim().length > 0);
    }, {
      timeout: CONFIG.TIMEOUTS.NAVIGATION_TIMEOUT
    }).catch(() => null);

    const issue = await page.evaluate(() => {
      const text = (document.body?.innerText || '').replace(/\s+/g, '');
      const blockedTexts = [
        '内容不存在',
        '作品不存在',
        '视频不见了',
        '暂时无法查看',
        '作者已设置仅自己可见',
        '该内容暂时无法访问'
      ];

      return blockedTexts.find(item => text.includes(item)) || '';
    });

    if (issue) {
      throw new Error('Content page is not available');
    }
  }

  private async dismissContentPopups(page: Page): Promise<void> {
    await page.keyboard.press('Escape').catch(() => {});

    await page.evaluate(() => {
      const closers = ['我知道了', '知道了', '以后再说', '稍后再说', '继续访问', '关闭', '同意', '允许'];
      const nodes = Array.from(document.querySelectorAll('button, [role="button"], div, span, a'));
      const target = nodes.find((node) => {
        const text = (node.textContent || '').replace(/\s+/g, '');
        return closers.some(item => text === item || text.includes(item));
      });

      if (target) {
        (target as HTMLElement).click();
      }
    }).catch(() => {});

    await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.FORM_SUBMIT_WAIT));
  }

  private async ensureInteractionActivated(page: Page, interaction: 'like' | 'favorite'): Promise<boolean> {
    const initialState = await this.getInteractionSnapshot(page, interaction);

    if (!initialState.found) {
      throw new Error(interaction === 'like' ? 'Like button not found' : 'Favorite button not found');
    }

    if (initialState.active) {
      return true;
    }

    const clicked = await this.clickInteractionButton(page, interaction);
    if (!clicked) {
      throw new Error(interaction === 'like' ? 'Like button not found' : 'Favorite button not found');
    }

    const expectedState = interaction === 'like' ? 'video-player-is-digged' : 'video-player-is-collected';
    await page.waitForFunction((kind, state) => {
      const selector = kind === 'like' ? '[data-e2e="video-player-digg"]' : '[data-e2e="video-player-collect"]';
      const element = document.querySelector(selector);
      return element?.getAttribute('data-e2e-state') === state;
    }, {
      timeout: CONFIG.TIMEOUTS.NAVIGATION_TIMEOUT,
    }, interaction, expectedState).catch(() => {});

    const finalState = await this.getInteractionSnapshot(page, interaction);
    if (!finalState.found || !finalState.active) {
      throw new Error(interaction === 'like' ? 'Like action did not succeed' : 'Favorite action did not succeed');
    }

    return true;
  }

  private async getInteractionSnapshot(page: Page, interaction: 'like' | 'favorite'): Promise<InteractionSnapshot> {
    return await page.evaluate((kind) => {
      const selector = kind === 'like' ? '[data-e2e="video-player-digg"]' : '[data-e2e="video-player-collect"]';
      const activeState = kind === 'like' ? 'video-player-is-digged' : 'video-player-is-collected';
      const inactiveState = kind === 'like' ? 'video-player-no-digged' : 'video-player-no-collect';

      const element = document.querySelector(selector) as HTMLElement | null;
      if (!element) {
        return {
          found: false,
          active: false,
        };
      }

      const isVisible = (element: Element) => {
        const rect = (element as HTMLElement).getBoundingClientRect();
        const style = window.getComputedStyle(element as HTMLElement);
        return rect.width > 0 &&
          rect.height > 0 &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.opacity !== '0';
      };

      if (!isVisible(element)) {
        return {
          found: false,
          active: false,
        };
      }

      const state = element.getAttribute('data-e2e-state') || '';
      return {
        found: true,
        active: state === activeState,
        text: element.textContent || state || inactiveState,
      };
    }, interaction);
  }

  private async clickInteractionButton(page: Page, interaction: 'like' | 'favorite'): Promise<boolean> {
    const selector = interaction === 'like' ? '[data-e2e="video-player-digg"]' : '[data-e2e="video-player-collect"]';
    const handle = await page.$(selector);
    if (!handle) {
      return false;
    }

    await handle.click();
    return true;
  }

  private async setCover(page: Page): Promise<boolean> {
    try {
      console.error('🖼️  Setting video cover...');

      // 等待视频处理完成，封面选项才会出现
      await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.PAGE_LOAD_WAIT));

      // 方法1：尝试点击"选择封面"按钮
      const coverSet = await page.evaluate(() => {
        // 查找封面相关的按钮或链接
        const selectors = [
          'button:has-text("选择封面")',
          'button:has-text("设置封面")',
          'span:has-text("选择封面")',
          '[class*="cover"] button',
          '[class*="Cover"] button',
          'div[class*="cover-select"]',
          'div[class*="coverSelect"]'
        ];

        // 查找包含"封面"文字的可点击元素
        const allElements = document.querySelectorAll('button, span, div[role="button"], a');
        for (const el of allElements) {
          const text = el.textContent?.trim() || '';
          if (text.includes('选择封面') || text.includes('设置封面') || text.includes('更换封面')) {
            (el as HTMLElement).click();
            return 'clicked_cover_button';
          }
        }

        return 'no_cover_button';
      });

      if (coverSet === 'clicked_cover_button') {
        await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.FORM_SUBMIT_WAIT));

        // 等待封面选择弹窗出现，然后选择第一个推荐封面或视频帧
        const coverSelected = await page.evaluate(() => {
          // 查找封面选择弹窗中的封面选项
          const coverOptions = document.querySelectorAll(
            '[class*="cover-item"], [class*="coverItem"], [class*="frame-item"], [class*="frameItem"], ' +
            '[class*="cover"] img, [class*="Cover"] img, [class*="thumbnail"], ' +
            'div[class*="cover-select"] img, div[class*="cover-list"] > div'
          );

          if (coverOptions.length > 0) {
            // 点击第一个封面选项
            (coverOptions[0] as HTMLElement).click();
            return 'selected_cover';
          }

          // 尝试查找并点击"使用当前帧"或类似按钮
          const frameButtons = document.querySelectorAll('button, span');
          for (const btn of frameButtons) {
            const text = btn.textContent?.trim() || '';
            if (text.includes('当前帧') || text.includes('使用此帧') || text.includes('截取封面')) {
              (btn as HTMLElement).click();
              return 'used_current_frame';
            }
          }

          return 'no_cover_options';
        });

        if (coverSelected !== 'no_cover_options') {
          await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.FORM_SUBMIT_WAIT));

          // 点击确认按钮
          await page.evaluate(() => {
            const confirmButtons = document.querySelectorAll('button');
            for (const btn of confirmButtons) {
              const text = btn.textContent?.trim() || '';
              if (text === '确定' || text === '确认' || text === '完成' || text.includes('使用')) {
                (btn as HTMLElement).click();
                return;
              }
            }
          });

          console.error('✅ Cover set successfully');
          return true;
        }
      }

      // 方法2：尝试直接点击封面区域触发选择
      const directCoverClick = await page.evaluate(() => {
        // 查找封面预览区域
        const coverAreas = document.querySelectorAll(
          '[class*="cover-preview"], [class*="coverPreview"], ' +
          '[class*="cover-container"], [class*="coverContainer"], ' +
          '[class*="cover-wrap"], [class*="coverWrap"], ' +
          'div[class*="cover"]:has(img)'
        );

        for (const area of coverAreas) {
          const rect = (area as HTMLElement).getBoundingClientRect();
          if (rect.width > 50 && rect.height > 50) {
            (area as HTMLElement).click();
            return 'clicked_cover_area';
          }
        }

        return 'no_cover_area';
      });

      if (directCoverClick === 'clicked_cover_area') {
        await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.FORM_SUBMIT_WAIT));

        // 尝试选择第一个可用封面
        await page.evaluate(() => {
          const options = document.querySelectorAll('[class*="cover"] img, [class*="frame"] img');
          if (options.length > 0) {
            (options[0] as HTMLElement).click();
          }
        });

        await new Promise(r => setTimeout(r, CONFIG.TIMEOUTS.FORM_SUBMIT_WAIT));

        // 确认选择
        await page.evaluate(() => {
          const buttons = document.querySelectorAll('button');
          for (const btn of buttons) {
            const text = btn.textContent?.trim() || '';
            if (text === '确定' || text === '确认' || text === '完成') {
              (btn as HTMLElement).click();
              return;
            }
          }
        });

        console.error('✅ Cover set via direct click');
        return true;
      }

      // 方法3：检查是否已有默认封面（有些情况下会自动选择）
      const hasDefaultCover = await page.evaluate(() => {
        const coverImages = document.querySelectorAll('[class*="cover"] img, [class*="Cover"] img');
        for (const img of coverImages) {
          const src = (img as HTMLImageElement).src;
          if (src && !src.includes('placeholder') && !src.includes('default')) {
            return true;
          }
        }
        return false;
      });

      if (hasDefaultCover) {
        console.error('✅ Default cover already set');
        return true;
      }

      console.error('⚠️  Could not auto-set cover, may need manual selection');
      return false;

    } catch (error) {
      console.error('Failed to set cover:',
        error instanceof Error ? error.message : String(error));
      return false;
    }
  }
}
