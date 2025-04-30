import { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';
// 富文本使用的文本消毒middleware
// Define the sanitize function
const sanitizeInput = (input: string) => {
    return sanitizeHtml(input, {
        allowedTags: ['p', 'strong', 'em', 'u', 'span', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        allowedAttributes: {},
    });
};
// Middleware to sanitize input
export const sanitizeMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.body.mainText)
    if (req.body.mainText) {
        req.body.mainText = sanitizeInput(req.body.mainText);
    }
    next();
};