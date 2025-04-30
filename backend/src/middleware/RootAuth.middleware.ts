import { Request, Response, NextFunction } from 'express';
import redisClients from '../config/redis.config';
import User from '../model/User.model';


export async function rootAuthentication(req: Request, res: Response, next: NextFunction): Promise<void> {

    try {
        const email = req.body.email;
        const user = await User.findOne({ where: { email } });

        if (!user){
            res.status(401).json({ message: 'Unauthorized: No user found under this email' });
            return;
        }

        if (user.permissionLevel !== 9){
            res.status(401).json({ message: 'Unauthorized: Admin permission required' });
            return;
        }

        next();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: errorMessage });
    }

}
