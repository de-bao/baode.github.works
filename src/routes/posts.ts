import { Request } from 'itty-router';
import { Env } from '../index';

export class Posts {
  // 获取文章列表
  static async list(request: Request, env: Env): Promise<Response> {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status') || 'published';
      const limit = parseInt(searchParams.get('limit') || '10');
      const offset = parseInt(searchParams.get('offset') || '0');

      let query = 'SELECT * FROM posts WHERE 1=1';
      const params: any[] = [];

      if (status !== 'all') {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const result = await env.DB.prepare(query).bind(...params).all();

      // 获取总数
      let countQuery = 'SELECT COUNT(*) as total FROM posts WHERE 1=1';
      const countParams: any[] = [];
      if (status !== 'all') {
        countQuery += ' AND status = ?';
        countParams.push(status);
      }
      const countResult = await env.DB.prepare(countQuery).bind(...countParams).first() as { total: number };

      // 解析 JSON 字段
      const posts = result.results.map((post: any) => ({
        ...post,
        tags: post.tags ? JSON.parse(post.tags) : [],
        categories: post.categories ? JSON.parse(post.categories) : [],
      }));

      return Response.json({
        posts,
        total: countResult?.total || 0,
        limit,
        offset,
      });
    } catch (error) {
      console.error('List posts error:', error);
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  // 获取单篇文章
  static async get(request: Request, env: Env): Promise<Response> {
    try {
      const slug = request.params?.slug;
      if (!slug) {
        return Response.json({ error: 'Slug is required' }, { status: 400 });
      }

      const post = await env.DB.prepare(
        'SELECT * FROM posts WHERE slug = ?'
      ).bind(slug).first() as any;

      if (!post) {
        return Response.json({ error: 'Not found' }, { status: 404 });
      }

      // 解析 JSON 字段
      post.tags = post.tags ? JSON.parse(post.tags) : [];
      post.categories = post.categories ? JSON.parse(post.categories) : [];

      return Response.json(post);
    } catch (error) {
      console.error('Get post error:', error);
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  // 创建文章
  static async create(request: Request, env: Env): Promise<Response> {
    try {
      const body = await request.json() as {
        title: string;
        content: string;
        excerpt?: string;
        tags?: string[];
        categories?: string[];
        date?: string;
        read_time?: number;
        status?: string;
      };

      if (!body.title || !body.content) {
        return Response.json({ error: 'Title and content are required' }, { status: 400 });
      }

      const id = crypto.randomUUID();
      const slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/^-|-$/g, '');
      const date = body.date || new Date().toISOString().split('T')[0];
      const status = body.status || 'draft';

      await env.DB.prepare(`
        INSERT INTO posts (id, title, slug, content, excerpt, date, tags, categories, read_time, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        body.title,
        slug,
        body.content,
        body.excerpt || '',
        date,
        JSON.stringify(body.tags || []),
        JSON.stringify(body.categories || []),
        body.read_time || 0,
        status
      ).run();

      return Response.json({ id, slug }, { status: 201 });
    } catch (error: any) {
      console.error('Create post error:', error);
      if (error.message?.includes('UNIQUE constraint')) {
        return Response.json({ error: 'Slug already exists' }, { status: 409 });
      }
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  // 更新文章
  static async update(request: Request, env: Env): Promise<Response> {
    try {
      const id = request.params?.id;
      if (!id) {
        return Response.json({ error: 'ID is required' }, { status: 400 });
      }

      const body = await request.json() as {
        title?: string;
        content?: string;
        excerpt?: string;
        tags?: string[];
        categories?: string[];
        read_time?: number;
        status?: string;
      };

      // 构建动态更新语句
      const updates: string[] = [];
      const values: any[] = [];

      if (body.title) {
        updates.push('title = ?');
        values.push(body.title);
        // 如果更新标题，也更新 slug
        const slug = body.title
          .toLowerCase()
          .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
          .replace(/^-|-$/g, '');
        updates.push('slug = ?');
        values.push(slug);
      }
      if (body.content) {
        updates.push('content = ?');
        values.push(body.content);
      }
      if (body.excerpt !== undefined) {
        updates.push('excerpt = ?');
        values.push(body.excerpt);
      }
      if (body.tags) {
        updates.push('tags = ?');
        values.push(JSON.stringify(body.tags));
      }
      if (body.categories) {
        updates.push('categories = ?');
        values.push(JSON.stringify(body.categories));
      }
      if (body.read_time !== undefined) {
        updates.push('read_time = ?');
        values.push(body.read_time);
      }
      if (body.status) {
        updates.push('status = ?');
        values.push(body.status);
      }

      if (updates.length === 0) {
        return Response.json({ error: 'No fields to update' }, { status: 400 });
      }

      updates.push("updated_at = datetime('now')");
      values.push(id);

      const query = `UPDATE posts SET ${updates.join(', ')} WHERE id = ?`;
      await env.DB.prepare(query).bind(...values).run();

      return Response.json({ success: true });
    } catch (error) {
      console.error('Update post error:', error);
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  // 删除文章
  static async delete(request: Request, env: Env): Promise<Response> {
    try {
      const id = request.params?.id;
      if (!id) {
        return Response.json({ error: 'ID is required' }, { status: 400 });
      }

      await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();

      return Response.json({ success: true });
    } catch (error) {
      console.error('Delete post error:', error);
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  // 发布文章（生成 Jekyll Markdown 格式）
  static async publish(request: Request, env: Env): Promise<Response> {
    try {
      const id = request.params?.id;
      if (!id) {
        return Response.json({ error: 'ID is required' }, { status: 400 });
      }

      const post = await env.DB.prepare('SELECT * FROM posts WHERE id = ?')
        .bind(id).first() as any;

      if (!post) {
        return Response.json({ error: 'Not found' }, { status: 404 });
      }

      // 解析 JSON 字段
      const tags = post.tags ? JSON.parse(post.tags) : [];
      const categories = post.categories ? JSON.parse(post.categories) : [];

      // 生成 Jekyll Front Matter
      const frontMatter = `---
layout: post
title: "${post.title.replace(/"/g, '\\"')}"
date: ${post.date}
tags: [${tags.map((t: string) => `"${t}"`).join(', ')}]
categories: [${categories.map((c: string) => `"${c}"`).join(', ')}]
excerpt: "${(post.excerpt || '').replace(/"/g, '\\"')}"
read_time: ${post.read_time || 0}
---

${post.content}
`;

      // 更新状态为已发布
      await env.DB.prepare(`
        UPDATE posts SET status = 'published', updated_at = datetime('now')
        WHERE id = ?
      `).bind(id).run();

      // 返回 Markdown 内容，可以用于提交到 GitHub
      return Response.json({
        id: post.id,
        slug: post.slug,
        filename: `${post.date}-${post.slug}.md`,
        content: frontMatter,
        status: 'published',
      });
    } catch (error) {
      console.error('Publish post error:', error);
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}
