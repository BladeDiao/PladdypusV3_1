import { Request, Response } from 'express';
import { getVenueHomeData, getAllArticlesForVenue, getWholeSpotContentService, getWholeSpotContentValidLeafContentService, getContentNamesByIdsService, changeSpotPropertyService } from '../service/Venue.service';

// get Venue Home Data
export const getVenueHome = async (req: Request, res: Response): Promise<void> => {
    try {
        const { venue_id } = req.params;
        const venueHomeData = await getVenueHomeData(venue_id);
        res.json(venueHomeData);
    } catch (error) {
        console.error('Error in getVenueHome:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
    }
};


// get all selected articles for a venue
export const getAllSelectedArticlesByVenueId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { venue_id } = req.params;

        // 获取 `Spot` 关联的文章
        const articlesForSpot = await getAllArticlesForVenue(venue_id);

        res.status(200).json(articlesForSpot);
    } catch (error) {
        console.error('Error in getAllSelectedArticlesBySpotId:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
    }
};

export const getWholeSpotContentController = async (req: Request, res: Response) => {
    try {

        const { venue_id } = req.params;

        const { email } = req.body;

        const contentTree = await getWholeSpotContentService(email, venue_id);
        res.json(contentTree);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        switch (errorMessage) {
            case 'failed to get user email':
                return res.status(404).json({ error: 'failed to get user email' });
            case 'Validation error':
                return res.status(404).json({ error: 'Validation error' });
            case 'Spot and User mismatch':
                return res.status(404).json({ error: 'Spot and User mismatch' });
            case 'Endpoint not found or no content associated':
                return res.status(404).json({ error: 'Endpoint not found or no content associated' });
            case 'Content root not found':
                return res.status(404).json({ error: 'Content root not found' });
            case 'No Spot Managed Endpoint Found':
                return res.status(404).json({ error: 'No Spot Managed Endpoint Found' });
            case 'Empty content tree':
                return res.status(404).json({ error: 'Empty content tree' });
            default:
                return res.status(500).json({ error: errorMessage });
        }
    }
};

// get all leaf content for a venue
export const getWholeSpotContentValidLeafContentController = async (req: Request, res: Response) => {
    try {

        const { venue_id } = req.params;

        const { email } = req.body;

        const contentTree = await getWholeSpotContentValidLeafContentService(email, venue_id);
        res.json(contentTree);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        switch (errorMessage) {
            case 'failed to get user email':
                return res.status(404).json({ error: 'failed to get user email' });
            case 'Validation error':
                return res.status(404).json({ error: 'Validation error' });
            case 'Spot and User mismatch':
                return res.status(404).json({ error: 'Spot and User mismatch' });
            case 'Endpoint not found or no content associated':
                return res.status(404).json({ error: 'Endpoint not found or no content associated' });
            case 'Content root not found':
                return res.status(404).json({ error: 'Content root not found' });
            case 'No Spot Managed Endpoint Found':
                return res.status(404).json({ error: 'No Spot Managed Endpoint Found' });
            case 'Empty content tree':
                return res.status(404).json({ error: 'Empty content tree' });
            default:
                return res.status(500).json({ error: errorMessage });
        }
    }
};

//根据ids获取content的名字
export const getContentNamesByIdsController = async (req: Request, res: Response) => {
    try {
        // 从请求体中同时获取 ids 和 email
        const { ids, email } = req.body;

        // 验证 ids 是否为非空数组
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Invalid input, expected an array of ids.' });
        }

        // 验证 email 是否存在
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid email field.' });
        }

        // 调用 service，根据 ids 查询 Content name
        const result = await getContentNamesByIdsService(ids);

        res.json(result);
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: errorMessage });
    }
};

//update a venue's property
export const changeSpotPropertyController = async (req: Request, res: Response) => {
    try {
        const { venue_id } = req.params;

        const { email, landing, theme, contact } = req.body;

        // 调用 service
        await changeSpotPropertyService(email, venue_id, landing, theme, contact);

        return res.status(200).json({ message: 'Spot property successfully changed' });
    } catch (error) {
        console.log('!!!', error);

        if (error instanceof Error) {
            switch (error.message) {
                case 'Insufficient Parameters':
                    return res.status(400).json({ error: 'Insufficient Parameters' });
                case 'User not found':
                    return res.status(404).json({ error: 'User not found' });
                case 'Spot not found':
                    return res.status(404).json({ error: 'Spot not found' });
                default:
                    // 其他错误
                    return res.status(500).json({ error: error.message });
            }
        }

        // 万一不是 `Error` 实例
        return res.status(500).json({ error: 'Unknown error' });
    }
};