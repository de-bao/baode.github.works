import { Request } from 'itty-router';
import { Env } from '../index';
import { generateToken } from '../utils/auth';

export class Auth {
  // 登录
  static async login(request: Request, env: Env): Promise<Response> {
    try {
      const body = await request.json() as {
        username: string;
        password: string;
      };

      // 简化版认证（生产环境应使用 bcrypt 验证密码）
      // 这里直接从环境变量或数据库验证
      if (body.username !== env.ADMIN_USERNAME) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      // 生产环境应该：
      // 1. 从数据库查询用户
      // 2. 使用 bcrypt 验证密码
      // 3. 生成真正的 JWT token
      
      // 简化实现：直接生成 token
      const token = generateToken(body.username, env.JWT_SECRET);

      return Response.json({
        token,
        username: body.username,
        expiresIn: 7 * 24 * 60 * 60, // 7 天
      });
    } catch (error) {
      console.error('Login error:', error);
      return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
}
