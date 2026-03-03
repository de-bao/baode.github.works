import { Router } from 'itty-router';
import { Posts } from './routes/posts';
import { Auth } from './routes/auth';
import { Upload } from './routes/upload';
import { authenticate } from './utils/auth';

export interface Env {
  DB: D1Database;
  MEDIA_BUCKET?: R2Bucket;  // 可选，如果未配置 R2
  ADMIN_USERNAME: string;
  JWT_SECRET: string;
}

const router = Router();

// 公开路由
router.post('/api/auth/login', Auth.login);
router.get('/api/posts', Posts.list);  // 公开获取已发布文章
router.get('/api/posts/:slug', Posts.get);  // 公开获取单篇文章（通过 slug）
router.get('/api/posts/id/:id', Posts.getById);  // 公开获取单篇文章（通过 ID）

// 需要认证的路由
router.post('/api/posts', authenticate, Posts.create);
router.put('/api/posts/:id', authenticate, Posts.update);
router.delete('/api/posts/:id', authenticate, Posts.delete);
router.post('/api/posts/:id/publish', authenticate, Posts.publish);
// R2 上传功能（需要先启用 R2 并创建 bucket，然后取消注释）
// router.post('/api/upload', authenticate, Upload.handle);
// router.get('/api/media', authenticate, Upload.list);

// 后台管理页面
router.get('/', () => {
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta http-equiv="refresh" content="0; url=/admin/">
    </head>
    <body>
      <p>Redirecting to <a href="/admin/">admin panel</a>...</p>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
});

router.get('/admin/', async () => {
  // 返回后台管理页面
  const html = await fetch('https://raw.githubusercontent.com/de-bao/de-bao.github.workers/main/admin/index.html')
    .catch(() => null);
  
  if (html && html.ok) {
    return new Response(await html.text(), {
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  // 如果无法从 GitHub 获取，返回简单提示
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>博客后台管理</title>
      <meta charset="UTF-8">
    </head>
    <body>
      <h1>后台管理页面</h1>
      <p>请将 admin/index.html 部署到静态托管服务（如 Cloudflare Pages）</p>
      <p>或访问: <a href="https://de-bao.github.io/admin/">https://de-bao.github.io/admin/</a></p>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
});

// 404
router.all('*', () => new Response('Not Found', { status: 404 }));

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // CORS 处理
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    try {
      const response = await router.handle(request, env, ctx);
      
      // 添加 CORS 头
      if (response) {
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Access-Control-Allow-Origin', '*');
        newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }
      
      return response || new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
