import { Env } from '../index';

// 简单的 JWT 验证（生产环境建议使用 jose 库）
export async function authenticate(
  request: Request,
  env: Env
): Promise<Response | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = authHeader.substring(7);
  
  try {
    // 简单的 token 验证（实际应该使用 JWT 库）
    // 这里简化处理，实际应该验证签名和过期时间
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    const payload = JSON.parse(atob(parts[1]));
    
    // 检查过期时间
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return new Response(JSON.stringify({ error: 'Token expired' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // 验证用户名
    if (payload.username !== env.ADMIN_USERNAME) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return null; // 认证通过
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// 生成 JWT token（简化版，生产环境应使用 jose 库）
export function generateToken(username: string, secret: string): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };
  
  const payload = {
    username,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 天过期
    iat: Math.floor(Date.now() / 1000),
  };
  
  // 简化实现，实际应使用 HMAC 签名
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  // 注意：这里没有真正的签名，仅用于演示
  // 生产环境必须使用 jose 库进行签名和验证
  return `${encodedHeader}.${encodedPayload}.signature`;
}
