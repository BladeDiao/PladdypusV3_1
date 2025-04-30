// src/config/redis.config.ts
import Redis from 'ioredis';
// Redis默认一共16个db 
// 0作为常用请求cahe
// 1作为后台用户登录token cache
// 2作为验证码cache
// 3作为article
const redisClients = {
    dataCache: new Redis({
        host: `${process.env.EC2_IP_ADDRESS}`,
        port: 6379,
        password: 'PladdypusV2,',
        db: 0
    }),
    tokenCache: new Redis({
        host: `${process.env.EC2_IP_ADDRESS}`,
        port: 6379,
        password: 'PladdypusV2,',
        db: 1
    }),
    captchaCache: new Redis({
        host: `${process.env.EC2_IP_ADDRESS}`,
        port: 6379,
        password: 'PladdypusV2,',
        db: 2
    }),
    articleCache: new Redis({
        host: `${process.env.EC2_IP_ADDRESS}`,
        port: 6379,
        password: 'PladdypusV2,',
        db: 3
    }),
    activationCache: new Redis({
        host: `${process.env.EC2_IP_ADDRESS}`,
        port: 6379,
        password: 'PladdypusV2,',
        db: 4
    })
};

Object.values(redisClients).forEach(client => {
    client.on('error', (err) => {
        console.error('Redis Client Error', err);
    });
});

export default redisClients;



