import { Request } from 'itty-router';
import { Env } from '../index';

export class Upload {
  // 上传文件到 R2
  static async handle(request: Request, env: Env): Promise<Response> {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return Response.json({ error: 'No file provided' }, { status: 400 });
      }

      // 生成唯一文件名
      const timestamp = Date.now();
      const ext = file.name.split('.').pop() || '';
      const key = `media/${timestamp}-${crypto.randomUUID()}.${ext}`;

      // 检查 R2 是否配置
      if (!env.MEDIA_BUCKET) {
        return Response.json({ error: 'R2 bucket not configured' }, { status: 503 });
      }

      // 上传到 R2
      await env.MEDIA_BUCKET.put(key, file.stream(), {
        httpMetadata: {
          contentType: file.type,
        },
        customMetadata: {
          originalName: file.name,
        },
      });

      // 保存到数据库
      const id = crypto.randomUUID();
      await env.DB.prepare(`
        INSERT INTO media (id, filename, r2_key, mime_type, size)
        VALUES (?, ?, ?, ?, ?)
      `).bind(id, file.name, key, file.type, file.size).run();

      // 返回文件信息
      // 注意：需要配置 R2 的公共访问或使用 Workers 代理访问
      return Response.json({
        id,
        filename: file.name,
        key,
        size: file.size,
        mimeType: file.type,
        // url: `https://your-r2-domain.com/${key}`, // 需要配置 R2 公共访问
      });
    } catch (error) {
      console.error('Upload error:', error);
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  // 获取文件列表
  static async list(request: Request, env: Env): Promise<Response> {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get('limit') || '20');
      const offset = parseInt(searchParams.get('offset') || '0');

      const result = await env.DB.prepare(`
        SELECT * FROM media 
        ORDER BY uploaded_at DESC 
        LIMIT ? OFFSET ?
      `).bind(limit, offset).all();

      return Response.json({
        media: result.results,
        total: result.results.length,
      });
    } catch (error) {
      console.error('List media error:', error);
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}
