import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import redisClients from '../config/redis.config';
import  User from '../model/User.model';

const tokenCache = redisClients.tokenCache;

export async function authenticateJWT(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const cachedToken = await tokenCache.get(token);
    if (!cachedToken) {
      res.status(401).json({ message: 'Unauthorized: Token not found' });
      return;
    }

    // 异步重置令牌的过期时间为24小时 
    tokenCache.set(token, cachedToken, 'EX', 24 * 60 * 60).catch((error) => {
      console.error('Failed to reset token expiration:', error);
    });
    
    //如果token的email和本身传递的email不相符则拦截
    if (cachedToken !== req.body.email){
      res.status(401).json({ message: 'Unauthorized: Token and email mismatch' });
      return;
    }   

    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }

}


export async function checkAdminPermissionLevel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 从 authenticateJWT 中间件里拿到的 email
    const email = req.body.email;
    // 或者：const email = req.user?.email; (看你怎么保存的)

    if (!email) {
      res.status(401).json({ message: 'Unauthorized: No email found after authentication' });
      return 
    }

    // 查询数据库
    const user = await User.findOne({
      where: { email: email },
    });

    // 如果没找到用户
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return 
    }

    // 检查权限
    if (user.permissionLevel >= 9) {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden: Insufficient permission level' });
      return 
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error });
    return 
  }
}
