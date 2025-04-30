import redisClients from '../config/redis.config';
import { Request, Response, NextFunction } from 'express';
const dataCache = redisClients.dataCache;
const articleCache = redisClients.articleCache
// 针对 任意会产生content修改的操作，清理所有content的内容
export async function contentLevelCacheClear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const keys = await dataCache.keys('*_content');
        if (keys.length > 0) {
            await dataCache.del(keys);
            console.log(`Successfully cleared ${keys.length} cache entries ending with '_content'`);
        } else {
            console.log('No cache entries found with "_content" suffix');
        }
        next();
    } catch (error) {
        console.error(`Failed to clear content cache: ${error}`);
        next(error);
    }
}
// 针对 任意会产生adv修改的操作，清理所有adv的内容
export async function advLevelCacheClear(req: Request, res: Response, next: NextFunction): Promise<void> {
    const keys = await dataCache.keys('*_adv');
    if (keys.length > 0) {
        await dataCache.del(keys);
        console.log(`Successfully cleared ${keys.length} cache entries ending with '_adv'`);
    } else {
        console.log('No cache entries found with "_adv" suffix');
    }
    next();
}
// 针对 任意会产生article修改的操作，清理对应article的内容
export async function articleLevelCacheClear(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.body.article_id) {
        console.log('no article_id detected');
    } else {
        const key = await articleCache.keys(`${req.body.article_id}_article`);
        if (key.length > 0) {
            await articleCache.del(key);
            await articleCache.del('articleCollection')
            console.log(`Successfully cleared article cache `);
        } else {
            console.log('No cache entries found with article cache');
        }
    }
    next();
}
export async function venueLevelCacheClear(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.body.venue_id) {
        console.log('no venue_id detected');
    } else {
        const key = await dataCache.keys(`${req.body.venue_id}_venue`);
        if (key.length > 0) {
            await dataCache.del(key);
            console.log(`Successfully cleared venue cache `);
        } else {
            console.log('No cache entries found with venue cache');
        }
    }
    next();
}